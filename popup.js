document.addEventListener('DOMContentLoaded', function() {
    const productInfo = document.getElementById('product-info');
    const saveButton = document.getElementById('save-button');
    const viewWatchlistButton = document.getElementById('view-watchlist');
    const watchlistSection = document.getElementById('watchlist');
    const watchlistItems = document.getElementById('watchlist-items');
    let currentProduct = null;

    // Request product information from content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "getProductInfo"}, function(response) {
            if (response && response.productName && response.productPrice) {
                currentProduct = response;
                productInfo.innerHTML = `
                    <p><strong>Product:</strong> ${response.productName}</p>
                    <p><strong>Price:</strong> ${response.productPrice}</p>
                `;
                saveButton.style.display = 'block';
            } else {
                productInfo.innerHTML = '<p>No product detected on this page.</p>';
                saveButton.style.display = 'none';
            }
        });
    });

    // Save product to watchlist
    saveButton.addEventListener('click', function() {
        if (!currentProduct) return;
        
        chrome.storage.local.get(['watchlist'], function(result) {
            const watchlist = result.watchlist || [];
            const newItem = {
                ...currentProduct,
                dateAdded: new Date().toISOString(),
                url: window.location.href
            };
            
            // Check if product already exists in watchlist
            const exists = watchlist.some(item => item.productName === currentProduct.productName);
            
            if (!exists) {
                watchlist.push(newItem);
                chrome.storage.local.set({ watchlist: watchlist }, function() {
                    alert('Product added to watchlist!');
                    displayWatchlist();
                });
            } else {
                alert('This product is already in your watchlist!');
            }
        });
    });

    // Toggle watchlist view
    viewWatchlistButton.addEventListener('click', function() {
        const isHidden = watchlistSection.style.display === 'none';
        watchlistSection.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            displayWatchlist();
        }
    });

    // Display watchlist items
    function displayWatchlist() {
        chrome.storage.local.get(['watchlist'], function(result) {
            const watchlist = result.watchlist || [];
            if (watchlist.length === 0) {
                watchlistItems.innerHTML = '<p>No items in watchlist.</p>';
                return;
            }

            watchlistItems.innerHTML = watchlist.map(item => `
                <div class="watchlist-item">
                    <h3>${item.productName}</h3>
                    <p>Current Price: ${item.productPrice}</p>
                    <p>Added: ${new Date(item.dateAdded).toLocaleDateString()}</p>
                </div>
            `).join('');
        });
    }

    // Initialize watchlist section as hidden
    watchlistSection.style.display = 'none';
});