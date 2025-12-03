import { TableClient } from "@azure/data-tables";
import { Token } from "./AkkkLogin";
import { randomUUID } from 'crypto';
import * as CryptoJS from 'crypto-js'

interface LinkParts {
    rowId: string;
    encryptionKey: string
}

interface EncryptedTokenEntity {
    partitionKey: string;
    rowKey: string
    encryptedData: string
}

export class TableAccess {
    private client: TableClient
    constructor() {
        this.client = TableClient.fromConnectionString(process.env["Table_ConnectionString"], "encryptedTokens");
    }

    public async insert(token: Token): Promise<LinkParts> {
        const rowId = randomUUID();
        const encryptionKey = randomUUID();

        const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(token), encryptionKey);

        this.client.createEntity({
            partitionKey: "tokens",
            rowKey: rowId,
            encryptedData: encryptedData.toString()
        })
        return {
            encryptionKey: encryptionKey,
            rowId: rowId
        }
    }

    public async getToken(rowId: string, encryptionKey: string): Promise<Token> {
        const tokenData = await this.client.getEntity<EncryptedTokenEntity>("tokens", rowId);
        const decryptedToken = CryptoJS.AES.decrypt(tokenData.encryptedData, encryptionKey).toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedToken)
    }
}