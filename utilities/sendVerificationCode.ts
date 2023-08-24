import nodemailer from 'nodemailer';

export const sendVerificationCode = async (to: string, username: string, code: string) => {

    const from = process.env.VERIFY_MAIL_ID

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: from,
            pass: process.env.VERIFY_MAIL_PASS
        },
    })

    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Kalam:wght@700&family=Poppins:wght@500;700;&display=swap" rel="stylesheet">
    </head>
    <body>
            <h1 style="padding: 3rem 1rem 1rem; text-align: end; color: white; background-color: cornflowerblue; font-weight: 700; font-family: 'Kalam', cursive;">Blog Now</h1>
    
            <div style="margin: 2rem 1rem; font-family: 'Poppins', sans-serif;">
                <p>Dear <span style="font-weight: 700;">${username}</span>,</p>
                <p>Verification code for registeration with <span style="font-weight: 700;">${to}</span> is: <span style="font-weight: 700;">${code}</span></p>
            </div>
    </body>
    </html>`

    const mailOptions = {
        from,
        to,
        subject: 'Verification Code',
        html
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        console.log(info.response)
        return { message: 'success' }
    }
    catch (ex) {
        console.log('Error sending mail...', ex)
        return { error: 'Error sending mail' }
    }

}