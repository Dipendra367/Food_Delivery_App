const twilio = require('twilio');

const sendSMS = async (to, body) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
        console.warn('Twilio credentials missing. Using Mock SMS.');
        console.log(`[MOCK SMS] To: ${to}, Body: ${body}`);
        return { success: true, mock: true };
    }

    const client = twilio(accountSid, authToken);

    try {
        const message = await client.messages.create({
            body: body,
            from: fromNumber,
            to: to
        });
        console.log('SMS sent:', message.sid);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error('Twilio Error:', error);
        if (error.code === 21608) {
            throw new Error('Twilio Free Trial: Destination number not verified. Please verify it in Twilio Console.');
        }
        throw error;
    }
};

const sendVerification = async (to) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_SERVICE_SID;

    if (!accountSid || !authToken || !serviceSid) {
        throw new Error('Twilio Verify credentials missing (SERVICE_SID required).');
    }

    const client = twilio(accountSid, authToken);

    try {
        const verification = await client.verify.v2.services(serviceSid)
            .verifications.create({ to, channel: 'sms' });
        console.log('Verification sent:', verification.sid);
        return { success: true, status: verification.status };
    } catch (error) {
        console.error('Twilio Verify Error:', error);
        throw error;
    }
};

const checkVerification = async (to, code) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_SERVICE_SID;

    if (!accountSid || !authToken || !serviceSid) {
        throw new Error('Twilio Verify credentials missing.');
    }

    const client = twilio(accountSid, authToken);

    try {
        const verificationCheck = await client.verify.v2.services(serviceSid)
            .verificationChecks.create({ to, code });

        console.log('Verification check:', verificationCheck.status);
        return {
            success: true,
            valid: verificationCheck.status === 'approved',
            status: verificationCheck.status
        };
    } catch (error) {
        console.error('Twilio Verify Check Error:', error);
        throw error;
    }
};

module.exports = { sendSMS, sendVerification, checkVerification };
