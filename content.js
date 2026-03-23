function injectScript() {
    const script = document.createElement('script');
    script.textContent = `
        (function() {
            // Setup UI: Square gray box, scrollable, SomMod title
            const container = document.createElement('div');
            container.style = "position:fixed; top:70px; right:20px; width:320px; max-height:450px; background:#222; color:#0f0; border:1px solid #444; z-index:999999; padding:15px; font-family:monospace; display:flex; flex-direction:column; box-shadow: 0 4px 15px rgba(0,0,0,0.5);";
            container.innerHTML = '<div style="margin-bottom:10px; border-bottom:1px solid #333; padding-bottom:5px; display:flex; justify-content:space-between;"><b style="color:#fff; font-size:12px;">SomMod by @samallx</b><span id="mod-status" style="font-size:9px; color:#555;">IDLE</span></div><div id="grade-list" style="overflow-y:auto; flex-grow:1;"></div>';
            document.body.appendChild(container);

            const updateUI = (items) => {
                const list = document.getElementById('grade-list');
                const status = document.getElementById('mod-status');
                if (!items || !list) return;

                // FILTER: Broadened to catch Aardrijkskunde and others
                const onlyTests = items.filter(i => {
                    const name = i.omschrijving || i.toetskolom?.omschrijving || "";
                    const val = i.cijfer || i.resultaat || i.waarde || i.label || "";
                    // Keep it if it has a value and isn't a summary/average
                    return name !== "" && val !== "" && !name.toLowerCase().includes("rapport") && !name.toLowerCase().includes("gemiddelde");
                });

                if (onlyTests.length === 0) return;

                status.innerText = "SYNCED";
                status.style.color = "#0f0";

                onlyTests.sort((a, b) => (b.periode || 0) - (a.periode || 0));

                list.innerHTML = onlyTests.map(i => {
                    const name = i.vak?.naam || i.omschrijving || i.toetskolom?.omschrijving || "Toets";
                    const val = i.cijfer || i.resultaat || i.waarde || i.label || "*";
                    const color = (parseFloat(val) < 5.5) ? "#ff4d4d" : "#00ff00";
                    return '<div style="padding:4px 0; display:flex; justify-content:space-between; align-items:center;">' +
                           '<span style="font-size:11px; color:#bbb;">P' + (i.periode || '?') + ' ' + name + '</span>' +
                           '<b style="color:' + color + '; font-size:16px;">' + val + '</b></div>';
                }).join('');
            };

            const XHR = XMLHttpRequest.prototype;
            const open = XHR.open;
            XHR.open = function(method, url) { this._url = url; return open.apply(this, arguments); };

            const send = XHR.send;
            XHR.send = function() {
                this.addEventListener('load', function() {
                    // UNIVERSAL LISTEN: If it's Somtoday API and contains a JSON list, check it
                    if (this._url.includes('api.somtoday.nl')) {
                        try {
                            const data = JSON.parse(this.responseText);
                            const items = data.items || (Array.isArray(data) ? data : [data]);
                            if (items && items.length > 0) updateUI(items);
                        } catch (e) {}
                    }
                });
                return send.apply(this, arguments);
            };
        })();
    `;
    (document.head || document.documentElement).appendChild(script);
}

injectScript();