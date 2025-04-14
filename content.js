// Define patterns for different websites
const patterns = [
    {
        match: /amazon\./,
        nameSelector: '#productTitle',
        priceSelector: '.a-price-whole'
    },
    {
        match: /ebay\./,
        nameSelector: '.x-item-title__mainTitle',
        priceSelector: '.x-price-primary'
    }
    // Add more patterns as needed
];

// Function to extract product information
function extractProductInfo() {
    const url = window.location.href;
    const pattern = patterns.find(p => p.match.test(url));
    
    if (!pattern) {
        return { name: 'Unknown Product', price: 'Price not found' };
    }

    const name = document.querySelector(pattern.nameSelector)?.innerText.trim() || 'Unknown Product';
    const price = document.querySelector(pattern.priceSelector)?.innerText.trim() || 'Price not found';

    return { name, price };
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getProductInfo") {
        const productInfo = extractProductInfo();
        sendResponse({ 
            data: { 
                ...productInfo,
                url: window.location.href 
            }
        });
    }
    return true; // Will respond asynchronously
});