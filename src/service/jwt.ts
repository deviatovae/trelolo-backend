import crypto from 'crypto';

const TOKEN_KEY = '15047601-154a-441f-a75a-7d2e64a99a27';

const createSignature = (head: string, body: string) => {
    return crypto
        .createHmac('SHA256', TOKEN_KEY)
        .update(`${head}.${body}`)
        .digest('base64');
};
export const createToken = (id: string): string => {
    const tokenHead = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'jwt' })).toString('base64');
    const tokenBody = Buffer.from(JSON.stringify({ id, iot: Date.now() })).toString('base64');
    const signature = createSignature(tokenHead, tokenBody);

    return `${tokenHead}.${tokenBody}.${signature}`;
};


export const isTokenValid = (token: string): boolean => {
    const [tokenHead, tokenBody, tokenSignature] = token.split('.');
    const signature = createSignature(tokenHead, tokenBody);

    return signature === tokenSignature;
};

export const getUserId = (token: string): string => {
    const tokenBody = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(tokenBody, 'base64').toString('utf8'));
    const { id }: { id: string, iot: number } = payload;

    return id;
};
