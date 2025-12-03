import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { AkkkTokenHandler } from "../utils/AkkkLogin";
import { TableAccess } from "../utils/TableAccess";
import { LinkCrypto } from "../utils/LinkCrypto";


export async function GetCalendarLink(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const formData = await request.formData();
    const username = formData.get('username');
    const password = formData.get('password');

    const ak = new AkkkTokenHandler();
    const resultToken = await ak.login(username.toString(), password.toString());

    if(resultToken.isErr()){
        return {
            status: 403,
            body: "invalid login"
        }
    }

    const token = resultToken.value;

    const tableClient = new TableAccess();
    const links = await tableClient.insert(token);

    const hashGen = new LinkCrypto();
    const hash = hashGen.getHash(links.rowId, links.encryptionKey);

    return {
        status: 302,
        headers: {
            'Location': '/calendarlink'
        },
        cookies: [
            {
                name: 'encryptedKey',
                value: links.encryptionKey,
                path: '/'
            },
            {
                name: 'rowId',
                value: links.rowId,
                path: '/'
            },
            {
                name: 'hash',
                value: hash,
                path: '/'
            }
        ]
    };
};

app.http('GetCalendarLink', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: GetCalendarLink
});
