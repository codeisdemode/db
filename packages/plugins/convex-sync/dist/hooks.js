var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { useEffect, useState } from 'react';
import { useColumnist } from 'columnist-db-hooks';
import { ConvexSyncAdapter } from './convex-adapter';
export function useConvexSync(options) {
    const { enabled = true } = options, syncOptions = __rest(options, ["enabled"]);
    const { db } = useColumnist({ name: 'default' });
    const [status, setStatus] = useState(null);
    useEffect(() => {
        if (!db || !enabled || !syncOptions.convexClient)
            return;
        const adapter = new ConvexSyncAdapter(Object.assign(Object.assign({}, syncOptions), { db }));
        const updateStatus = () => setStatus(adapter.getStatus());
        const unsubscribe = adapter.onSyncEvent((event) => {
            if (event.type === 'sync-start' || event.type === 'sync-complete' || event.type === 'sync-error') {
                updateStatus();
            }
        });
        adapter.start().catch(console.error);
        return () => {
            unsubscribe();
            adapter.stop().catch(console.error);
        };
    }, [db, enabled, syncOptions]);
    return { status };
}
//# sourceMappingURL=hooks.js.map