import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { Moment } from "moment";
import { TableAccess } from "../utils/TableAccess";
import axios from "axios";
import moment = require("moment");
import { AkkkTokenHandler } from "../utils/AkkkLogin";
import { LinkCrypto } from "../utils/LinkCrypto";
import ical from "ical-generator";
import { htmlToText } from "html-to-text";

interface ActivityItem {
    activityName: string;
    fromTime: Moment;
    toTime: Moment;
    isOnWaitinglist: boolean;
    description?: string;
    locationName?: string;
}

// Helper function to clean HTML for calendar compatibility while preserving useful formatting
function cleanHtmlForCalendar(html: string): string {
    if (!html) return '';
    
    return htmlToText(html, {
        wordwrap: false,
        preserveNewlines: true,
        selectors: [
            // Preserve links
            { selector: 'a', options: { ignoreHref: false } },
            // Convert headers to bold with line breaks
            { selector: 'h1', format: 'block' },
            { selector: 'h2', format: 'block' },
            { selector: 'h3', format: 'block' },
            { selector: 'h4', format: 'block' },
            { selector: 'h5', format: 'block' },
            { selector: 'h6', format: 'block' },
            // Preserve paragraphs with spacing
            { selector: 'p', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
            // Preserve line breaks
            { selector: 'br', format: 'lineBreak' }
        ],
        // Keep basic formatting in output
        formatters: {
            'anchor': (elem, walk, builder, options) => {
                const href = elem.attribs && elem.attribs.href;
                const text = walk(elem.children, builder);
                return href ? `${text} (${href})` : text;
            }
        }
    });
}

export async function GetCalendarData(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const rowId = request.params.rowId;
    const decryptKey = request.params.decryptKey;
    const hash = request.params.hash;

    if (!rowId || !decryptKey || !hash) {
        return {
            status: 400,
            jsonBody: { error: "Missing required parameters" }
        };
    }

    const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!guidPattern.test(rowId) || !guidPattern.test(decryptKey)) {
        return {
            status: 400,
            jsonBody: { error: "Invalid GUID format" }
        };
    }

    const hashCheck = new LinkCrypto();
    if (!hashCheck.verifyHash(rowId, decryptKey, hash)) {
        return {
            status: 403,
            jsonBody: { error: "Invalid link" }
        };
    }

    const tableClient = new TableAccess();
    var token = await tableClient.getToken(rowId, decryptKey);

    if (moment(token.expiresIn).isBefore(moment())) {
        const tokenHandler = new AkkkTokenHandler();
        token = await tokenHandler.refresh(token);
    }

    const response = await axios.get(
        `https://www.aarhuskanokajak.dk/api/booking?memberId=${token.memberId}`,
        { headers: { Authorization: `Bearer ${token.accessToken}` } }
    )

    // Map the raw API response to ActivityItem format with enriched descriptions
    const calendarItems: ActivityItem[] = await Promise.all(
        response.data.map(async (item: any) => {
            let description = '';
            let locationName = '';

            const eventResponse = await axios.get(
                `https://www.aarhuskanokajak.dk/api/activity/${item.activityId}/event/${item.eventId}`,
                { headers: { Authorization: `Bearer ${token.accessToken}` } }
            );
            description = cleanHtmlForCalendar(eventResponse.data.description || '');
            locationName = eventResponse.data.locationName || '';

            return {
                activityName: item.activityName,
                fromTime: moment(item.fromTime),
                toTime: moment(item.toTime),
                isOnWaitinglist: item.isOnWaitingList,
                description,
                locationName
            };
        })
    );

    // Create iCal calendar
    const calendar = ical({
        name: 'Aarhus Kano & Kajak Kalender',
        description: 'Kalender for dine tilmeldte aktiviteter',
        timezone: 'UTC',
        url: 'https://www.aarhuskanokajak.dk'
    });

    // Add events to calendar
    calendarItems.forEach(item => {
        const eventSummary = item.isOnWaitinglist
            ? `${item.activityName} (Venteliste)`
            : item.activityName;

        calendar.createEvent({
            start: item.fromTime.toDate(),
            end: item.toTime.toDate(),
            summary: eventSummary,
            description: item.description || '',
            location: item.locationName || 'Aarhus Kano & Kajak'
        });
    });

    return {
        status: 200,
        body: calendar.toString(),
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': 'attachment; filename="kajak-kalender.ics"'
        }
    };
};

app.http('GetCalendarData', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'GetCalendarData/{rowId:guid}/{decryptKey:guid}/{hash}',
    handler: GetCalendarData
});
