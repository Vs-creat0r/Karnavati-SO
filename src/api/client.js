const API_URL = import.meta.env.VITE_API_URL || "https://n8n.webhook/placeholder";

/**
 * Centrailzed API wrapper for Society Management Dashboard.
 * Sends POST requests effectively to a single endpoint.
 *
 * @param {string} action - The action identifier (e.g., 'GET_WATER_BILLS').
 * @param {object} payload - The data to send with the request.
 * @returns {Promise<any>} - The response data or null on failure.
 */
export async function callApi(action, payload = {}) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ action, payload }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        const text = await response.text();

        if (!text || text.trim() === "") {
            return null;
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            // Handle plain text response gracefully
            console.warn("API returned non-JSON response:", text);
            return { message: text, success: true }; // Treat text as success message
        }
    } catch (error) {
        console.error("API Call Failed:", error);
        return null; // Return null to prevent UI crashes, let UI handle 'no data' state
    }
}
