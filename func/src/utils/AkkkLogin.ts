import axios, {AxiosResponse} from 'axios';
import * as moment from 'moment';
import { Moment } from 'moment';
import * as oauth from 'oauth4webapi'
import { Result, ok, err } from 'neverthrow';

export interface Token {
    accessToken: string;
    refreshToken: string;
    expiresIn: Moment;
    memberId: string
}

export class AkkkTokenHandler {
    private siteId = process.env["Site_id"];

    private client: oauth.Client;
    private authServer: oauth.AuthorizationServer;

    constructor() {
        this.authServer = {
            issuer: 'https://www.aarhuskanokajak.dk',
            token_endpoint: 'https://www.aarhuskanokajak.dk/auth/token',
        };

        this.client = {
            client_id: process.env["Client_Id"],
            client_secret: process.env["Client_Secret"],
            token_endpoint_auth_method: 'client_secret_basic',
        };
    }

    public async login(username: string, password: string): Promise<Result<Token, string>> {
        const params = new URLSearchParams();
        params.set('username', username);
        params.set('password', password);

        const clientAuth = oauth.ClientSecretBasic(this.client.client_secret as string);
        const response = await oauth.genericTokenEndpointRequest(
            this.authServer,
            this.client,
            clientAuth,
            'password',
            params,
            {
                headers: {
                    'x-siteid': this.siteId,
                },
            }
        );
        if(!response.ok){
            return err("Login invalid")
        }

        const result = await oauth.processGenericTokenEndpointResponse(
            this.authServer,
            this.client,
            response
        );

        const userInfo : AxiosResponse<MemberData> = await axios.get("https://www.aarhuskanokajak.dk/api/members/menoca", {headers: {Authorization: `Bearer ${result.access_token}`}})

        return ok({accessToken: result.access_token, refreshToken: result.refresh_token, expiresIn: moment().add(result.expires_in, 'seconds').subtract(60, 'seconds'), memberId: userInfo.data.entityId})
    }

    public async refresh(token: Token): Promise<Token> {
        const clientAuth = oauth.ClientSecretBasic(this.client.client_secret as string);
        const response = await oauth.refreshTokenGrantRequest(
        this.authServer,
        this.client,
        clientAuth,
        token.refreshToken,
        {
            headers: {
            'x-siteid': this.siteId,
            },
        }
        );

        const result = await oauth.processRefreshTokenResponse(
        this.authServer,
        this.client,
        response
        );

        return {accessToken: result.access_token, refreshToken: result.refresh_token, expiresIn: moment().add(result.expires_in, 'seconds').subtract(60, 'seconds'), memberId: token.memberId}
    }
}

interface MemberData {
    entityId: string
}