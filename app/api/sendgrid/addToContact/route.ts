import { NextResponse } from 'next/server';
import { Client } from '@sendgrid/client';

const client = new Client();
client.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
    try {
        const { email, firstName } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Add to contact list
        const data = {
            contacts: [{
                email,
                first_name: firstName,
            }],
            list_ids: [process.env.SENDGRID_LIST_ID!]
        };

        await client.request({
            method: 'PUT',
            url: '/v3/marketing/contacts',
            body: data,
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Contact added to list' 
        });

    } catch (error: any) {
        console.error('SendGrid Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to add contact' },
            { status: 500 }
        );
    }
} 