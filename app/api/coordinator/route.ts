import { NextResponse } from 'next/server';
import { agentManager } from '@/lib/agentManager';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { messages } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Invalid request body - messages array required' },
                { status: 400 }
            );
        }
        const coordinatorAgent = await agentManager.getCoordinatorAgent();

        if (!coordinatorAgent) {
            return NextResponse.json(
                { error: 'Coordinator agent not initialized' },
                { status: 500 }
            );
        }

        const response = await coordinatorAgent.invoke({
            messages
        });

        return NextResponse.json({
            status: 'success',
            response
        });

    } catch (error) {
        console.error('Error invoking coordinator agent:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
} 