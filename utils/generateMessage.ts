export async function generatePersonalizedMessage(
    schoolId: string, 
    userId: string, 
    template: string
) {
    console.log('Calling API with:', { schoolId, userId, template });
    
    const response = await fetch('/api/generatePersonalizedMessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            schoolId,
            userId,
            template,
        }),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate message');
    }
    
    return response.json();
} 