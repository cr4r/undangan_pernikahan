(function (window) {
    // --- OBFUSCATED CONFIGURATION ---
    // Decodes to: https://script.google.com/macros/s/AKfycbz6K7p1CRL_lQlyTw6jbp_CU3wjq7FRJXv1ZtBtxs4KF1NjYftk6caCZj435d_E-5s/exec
    const _0xurl = [
        '\x68\x74\x74\x70\x73\x3a\x2f\x2f\x73\x63\x72\x69\x70\x74\x2e\x67\x6f\x6f\x67\x6c\x65\x2e\x63\x6f\x6d\x2f\x6d\x61\x63\x72\x6f\x73\x2f\x73\x2f',
        'AKfycbwR8Wmd3d_bt7pY2Y14bCAHr3cG-73MFu5d_FJQ7vDpI4hvLVHsFEN_vfQ0c47D48cB',
        '\x2f\x65\x78\x65\x63'
    ];
    // Decodes to: cr4r_wedding_secret_2026
    const _0xkey = '\x63\x72\x34\x72\x5f\x77\x65\x64\x64\x69\x6e\x67\x5f\x73\x65\x63\x72\x65\x74\x5f\x32\x30\x32\x36';

    window.GAS_URL = _0xurl.join('');
    window.API_KEY = _0xkey;

    // --- CENTRALIZED API REQUESTER ---
    window.apiRequest = function (action, data, successCallback, errorCallback) {
        const payload = Object.assign({ action: action, apiKey: window.API_KEY }, data);

        fetch(window.GAS_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    const out = (res.data && res.data.result !== undefined) ? res.data.result : res.data;
                    if (successCallback) successCallback(out);
                } else {
                    if (errorCallback) errorCallback(res.message);
                }
            })
            .catch(err => {
                console.error("API Error:", err);
                if (errorCallback) errorCallback(err.toString());
            });
    };

    // --- ANTI VIEW-SOURCE & ANTI-INSPECT ---
    document.addEventListener('contextmenu', event => event.preventDefault());
    document.onkeydown = function (e) {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (e.keyCode == 123) { return false; }
        if (e.ctrlKey && e.shiftKey && e.keyCode == 73) { return false; }
        if (e.ctrlKey && e.shiftKey && e.keyCode == 74) { return false; }
        if (e.ctrlKey && e.keyCode == 85) { return false; }
    };

})(window);
