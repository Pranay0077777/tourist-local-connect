
async function verifyPaymentRoute() {
    try {
        console.log("Testing POST /api/payments/create-payment-intent (expecting error or success)...");
        // We send an empty body, passing no bookingId.
        // We expect a 400 Bad Request (because bookingId is missing) or 500.
        // If we get 404, the route doesn't exist.
        const res = await fetch('http://localhost:3001/api/payments/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        console.log(`Status Code: ${res.status}`);
        const text = await res.text();
        console.log(`Response: ${text}`);

        if (res.status === 404) {
            console.error("FAILED: Route not found (404)");
        } else if (res.status === 400) {
            console.log("SUCCESS: Route is active (returned 400 as expected for empty body)");
        } else {
            console.log("SUCCESS: Route returned response");
        }

    } catch (e) {
        console.error("Connection Failed:", e);
    }
}

verifyPaymentRoute();
