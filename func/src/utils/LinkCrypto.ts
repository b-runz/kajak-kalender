import { createHmac, timingSafeEqual } from 'crypto';

export class LinkCrypto {
    private readonly hashingKey = process.env["Hashing_Key"]

    public getHash(rowId: string, decryptKey: string): string {
        const hmacHash = this.generateHmac(rowId, decryptKey);
        const parityChar = this.calculateParityCheck(hmacHash);
        return hmacHash + parityChar;
    }

    public verifyHash(rowId: string, decryptKey: string, providedHash: string): boolean {
        if (!this.isValidHashFormat(providedHash)) {
            return false;
        }

        const hmacPart = providedHash.slice(0, -1);
        const providedParity = providedHash.slice(-1);

        const expectedParity = this.calculateParityCheck(hmacPart);
        if (providedParity !== expectedParity) {
            return false;
        }

        const expectedHash = this.generateHmac(rowId, decryptKey);
        return timingSafeEqual(
            Buffer.from(expectedHash, 'hex'),
            Buffer.from(hmacPart, 'hex')
        );
    }

    private generateHmac(rowId: string, decryptKey: string): string {
        const data = `${rowId}:${decryptKey}`;
        return createHmac('sha256', this.hashingKey).update(data).digest('hex');
    }

    private calculateParityCheck(hash: string): string {
        let xorResult = 0;
        for (let i = 0; i < hash.length; i += 2) {
            const byte = parseInt(hash.substring(i, i + 2), 16);
            xorResult ^= byte;
        }
        return (xorResult & 0x0F).toString(16);
    }

    private isValidHashFormat(hash: string): boolean {
        return hash &&
            hash.length === 65 &&
            /^[0-9a-f]+$/i.test(hash);
    }
}