(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/// <reference path="../../../shared/runtime/runtime-types.d.ts" />
/// <reference path="../../../shared/runtime/dev-globals.d.ts" />
/// <reference path="../../../shared/runtime/dev-protocol.d.ts" />
/// <reference path="../../../shared/runtime/dev-extensions.ts" />
__turbopack_context__.s([
    "connect",
    ()=>connect,
    "setHooks",
    ()=>setHooks,
    "subscribeToUpdate",
    ()=>subscribeToUpdate
]);
function connect({ addMessageListener, sendMessage, onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case 'turbopack-connected':
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn('[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.');
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error('A separate HMR handler was already registered');
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: 'turbopack-subscribe',
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: 'turbopack-unsubscribe',
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: 'ChunkListUpdate',
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted' || updateA.type === 'deleted' && updateB.type === 'added') {
        return undefined;
    }
    if (updateB.type === 'total') {
        // A total update replaces the entire chunk, so it supersedes any prior update.
        return updateB;
    }
    if (updateA.type === 'partial') {
        invariant(updateA.instruction, 'Partial updates are unsupported');
    }
    if (updateB.type === 'partial') {
        invariant(updateB.instruction, 'Partial updates are unsupported');
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: 'EcmascriptMergedUpdate',
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted') {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === 'deleted' && updateB.type === 'added') {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: 'partial',
            added,
            deleted
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'partial') {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: 'partial',
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === 'added' && updateB.type === 'partial') {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: 'added',
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'deleted') {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: 'deleted',
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    'bug',
    'error',
    'fatal'
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    'bug',
    'fatal',
    'error',
    'warning',
    'info',
    'log'
];
const CATEGORY_ORDER = [
    'parse',
    'resolve',
    'code generation',
    'rendering',
    'typescript',
    'other'
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case 'issues':
            break;
        case 'partial':
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === 'notFound') {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}),
"[project]/pages/index.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
;
function Home() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        dangerouslySetInnerHTML: {
            __html: `
      <!DOCTYPE html>
      <html lang="el">
      <head>
          <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZILVER PÂTISSERIE</title>
    
    <link rel="icon" type="image/png" href="/favicon.png">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Montserrat:ital,wght@0,300;0,500;1,300&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

    <style>
        /* --- Smooth Scroll Setup --- */
        html.lenis, html.lenis body { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto !important; }
        .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
        .lenis.lenis-stopped { overflow: hidden; }

        :root {
            --dark-blue: #0072ce;
            --light-blue: #a9c8eb;
            --accent-font: 'Montserrat', sans-serif;
            --body-font: 'Libre Baskerville', serif;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            background-color: var(--light-blue);
            color: var(--dark-blue);
            font-family: var(--body-font);
            line-height: 1.6;
            overflow-x: hidden;
            scrollbar-width: none;
        }

        body::-webkit-scrollbar { display: none; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 5%; position: relative; }

        /* --- Navigation --- */
        nav {
            padding: 30px 5%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(0, 114, 206, 0.15);
            position: sticky;
            top: 0;
            background-color: var(--light-blue);
            z-index: 2000;
        }

        .nav-logo img { height: 40px; width: auto; }
        .nav-tabs { display: flex; gap: 40px; list-style: none; }
        .nav-tabs a {
            text-decoration: none;
            color: var(--dark-blue);
            font-family: var(--accent-font);
            font-weight: 500;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 2.5px;
            transition: opacity 0.3s ease;
        }
        .nav-tabs a:hover { opacity: 0.6; }

        /* --- Dropdown --- */
        .menu-icon-btn { 
            display: none; 
            background: none; 
            border: none; 
            color: var(--dark-blue); 
            cursor: pointer; 
            padding: 5px; 
            transition: transform 0.3s ease; 
            align-items: center;
        }
        .dropdown-menu { position: absolute; top: 100%; left: 0; width: 100%; background-color: var(--light-blue); border-bottom: 1px solid var(--dark-blue); max-height: 0; overflow: hidden; transition: max-height 0.5s cubic-bezier(0.77, 0, 0.175, 1); z-index: 1999; }
        .dropdown-menu.active { max-height: 350px; }
        .dropdown-links { list-style: none; padding: 40px 0; text-align: center; }
        .dropdown-links li { margin: 20px 0; }
        .dropdown-links a { text-decoration: none; color: var(--dark-blue); font-family: var(--accent-font); font-size: 1.1rem; text-transform: uppercase; letter-spacing: 3px; }

        /* --- Hero --- */
        header { 
            margin: 60px 0 100px; 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            gap: 30px; 
        }
        .hero-text-wrapper { flex: 1.6; min-width: 0; }
        
        .hero-logo {
            width: 100%;
            max-width: 600px;
            height: auto;
            margin-bottom: 30px;
            display: block;
        }

        .hero-image-wrapper { flex: 1; max-width: 450px; }
        .hero-image-wrapper img { width: 100%; height: auto; display: block; border-radius: 4px; }
        
        .hero-sub { 
            font-size: clamp(0.85rem, 2vw, 1.3rem); 
            max-width: 500px; 
            opacity: 0.8; 
            font-style: normal;
            text-align: center; 
            margin: 0 auto; 
        }

        /* --- Story --- */
        .story-section { 
            border-top: 1px solid var(--dark-blue); 
            padding-top: 80px; 
            margin-bottom: 120px; 
            display: grid; 
            grid-template-columns: 1fr 1.2fr; 
            gap: 80px; 
            align-items: center; 
        }
        .story-image-wrapper img { width: 100%; height: auto; display: block; }
        .story-section h3 { font-family: var(--accent-font); font-weight: 300; text-transform: uppercase; font-size: 1.1rem; margin-bottom: 30px; letter-spacing: 5px; }
        .story-section p { font-size: 1.15rem; line-height: 1.8; opacity: 0.9; }

        /* --- Marquee --- */
        .news-marquee-container { 
            width: 100%; border-top: 1px solid var(--dark-blue); border-bottom: 1px solid var(--dark-blue); padding: 30px 0; margin-bottom: 100px; overflow: hidden; position: relative; 
            mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent); 
        }
        .marquee-content { display: flex; white-space: nowrap; animation: scroll 60s linear infinite; }
        .marquee-item { padding: 0 60px; text-decoration: none; color: var(--dark-blue); transition: opacity 0.3s ease; }
        .marquee-item:hover { opacity: 0.6; }
        .marquee-item span { font-family: var(--accent-font); font-size: 0.65rem; display: block; margin-bottom: 8px; letter-spacing: 2px; text-transform: uppercase; font-weight: 500;}
        .marquee-item h4 { font-size: 1.4rem; font-weight: 400; font-style: italic; }
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        /* --- Wolt --- */
        .wolt-cta-section { text-align: center; margin-bottom: 160px; }
        .wolt-button { display: inline-flex; align-items: center; justify-content: center; gap: 25px; color: var(--dark-blue); padding: 18px 50px; text-decoration: none; font-family: var(--accent-font); font-size: 0.85rem; letter-spacing: 2px; border: 1px solid var(--dark-blue); border-radius: 100px; transition: all 0.5s ease; text-transform: uppercase; }
        .wolt-button:hover { background-color: var(--dark-blue); color: var(--light-blue) !important; }

        /* --- Footer --- */
        footer { border-top: 1px solid var(--dark-blue); padding: 80px 0 40px; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 60px; position: relative; }
        .footer-title { font-family: var(--accent-font); font-size: 0.7rem; margin-bottom: 25px; display: block; letter-spacing: 3px; text-transform: uppercase; font-weight: 500; }
        .footer-content p { font-size: 1rem; margin-bottom: 8px; }
        .hours-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.95rem; }
        .footer-links a { display: block; color: var(--dark-blue); text-decoration: none; margin-bottom: 10px; transition: opacity 0.3s ease; }
        .footer-links a:hover { opacity: 0.6; }

        .signature { grid-column: 1 / -1; text-align: right; font-family: var(--accent-font); font-size: 0.55rem; letter-spacing: 1px; text-transform: uppercase; opacity: 0.4; margin-top: 30px; }

        /* --- RESPONSIVE UPDATES --- */
        @media (max-width: 768px) {
            .nav-tabs { display: none; }
            .menu-icon-btn { display: flex; }
            
            /* Hero stays side-by-side but shrinks gaps */
            header { gap: 15px; margin: 40px 0; }
            .hero-logo { margin-bottom: 15px; }
            .hero-text-wrapper { text-align: center; }
            .hero-sub { font-size: 0.85rem; }

            /* Story Section now performs like Hero (Side-by-Side) */
            .story-section { 
                grid-template-columns: 1fr 1.5fr; /* Keeps it side-by-side */
                gap: 20px; 
                padding-top: 40px;
            }
            .story-section h3 { font-size: 0.8rem; letter-spacing: 2px; margin-bottom: 10px; }
            .story-section p { font-size: 0.85rem; line-height: 1.5; }

            .signature { text-align: center; }
            .marquee-item h4 { font-size: 1.1rem; }
            .hero-logo { max-width: 100%; }
        }
    </style>
      </head>
      <body>
          <nav>
        <div class="nav-logo">
            <a href="/"><img src="/logo.png" alt="Zilver Logo"></a>
        </div>
        <ul class="nav-tabs">
            <li><a href="/kat.html">Κατάλογος</a></li>
            <li><a href="/about.html">Σχετικά με εμάς</a></li>
            <li><a href="/cake.html">Δημιουργίες</a></li>
        </ul>
        <button class="menu-icon-btn" id="menu-btn">
            <span class="material-symbols-outlined" style="font-size: 32px;">menu</span>
        </button>
        <div class="dropdown-menu" id="dropdown-menu">
            <ul class="dropdown-links">
                <li><a href="/kat.html">Κατάλογος</a></li>
                <li><a href="/about.html">Σχετικά με εμάς</a></li>
                <li><a href="/cake.html">Δημιουργίες</a></li>
            </ul>
        </div>
    </nav>

    <div class="container">
        <header>
            <div class="hero-text-wrapper">
                <img src="/logo.png" alt="Zilver Patisserie" class="hero-logo">
                <p class="hero-sub">Μια σύγχρονη patisserie στη Φιλοθέη με σεβασμό στην παράδοση και την πρώτη ύλη.</p>
            </div>
            <div class="hero-image-wrapper">
                <img src="/title.jpg" alt="Zilver Patisserie">
            </div>
        </header>

        <section class="story-section">
            <div class="story-image-wrapper">
                <img src="/mom.jpg" alt="Inspiration - Argyro">
            </div>
            <div class="story-text-wrapper">
                <h3>Zilver / Ασήμι</h3>
                <p>Ένας διακριτικός φόρος τιμής στη μητέρα της δημιουργού, την Αργυρώ. Εδώ, το γλυκό δεν είναι απλώς ένα προϊόν, αλλά μέρος μιας καθημερινής τελετουργίας.</p>
            </div>
        </section>
    </div>

    <div class="news-marquee-container">
        <div class="marquee-content">
            <a href="https://www.athinorama.gr/restaurants/3061552/zilver-to-neo-kafe-zaxaroplasteio-tis-filotheis-kanei-ti-diafora/" target="_blank" class="marquee-item">
                <span>Athinorama</span><h4>Το νέο σημείο αναφοράς.</h4>
            </a>
            <a href="https://www.athensvoice.gr/life/geusi/themata/936822/zilver-kouklistiko-zaharoplasteio-me-kalo-gluko-apo-heri-gunaikeio/" target="_blank" class="marquee-item">
                <span>Athens Voice</span><h4>Κουκλίστικο και αυθεντικό.</h4>
            </a>
            <a href="https://www.iciao.gr/afieromata/kafes-tyropita-glyko-oi-mikres-kathimerines-apolayseis/zilver-patisserie/" target="_blank" class="marquee-item">
                <span>iCiao</span><h4>Οι μικρές καθημερινές απολαύσεις.</h4>
            </a>
            <a href="https://www.tovima.gr/2026/03/02/elliniki-kouzina/ta-aglyka-glyka-tis-elenis-pou-se-xortainoun-xoris-na-se-ligonoun/" target="_blank" class="marquee-item">
                <span>To Vima</span><h4>Η τέχνη της Ελένης.</h4>
            </a>
            <a href="https://www.athinorama.gr/restaurants/3061552/zilver-to-neo-kafe-zaxaroplasteio-tis-filotheis-kanei-ti-diafora/" target="_blank" class="marquee-item">
                <span>Athinorama</span><h4>Το νέο σημείο αναφοράς.</h4>
            </a>
            <a href="https://www.athensvoice.gr/life/geusi/themata/936822/zilver-kouklistiko-zaharoplasteio-me-kalo-gluko-apo-heri-gunaikeio/" target="_blank" class="marquee-item">
                <span>Athens Voice</span><h4>Κουκλίστικο και αυθεντικό.</h4>
            </a>
        </div>
    </div>

    <div class="container">
        <div class="wolt-cta-section">
            <a href="https://wolt.com/en/grc/athens/restaurant/zilver-patisserie" target="_blank" class="wolt-button">Order on Wolt →</a>
        </div>
    </div>

    <div class="container">
        <footer>
            <div class="footer-content">
                <span class="footer-title">Visit Us</span>
                <p>Thrakis 2, Filothei 152 37</p>
                <p style="margin-top: 15px;"><strong>T.</strong> 210 6851918</p>
            </div>
            <div class="footer-content">
                <span class="footer-title">Opening Hours</span>
                <div class="hours-grid">
                    <span>Mon - Thu</span> <span>08:30 – 20:30</span>
                    <span>Friday</span> <span>08:30 – 22:00</span>
                    <span>Sat - Sun</span> <span>09:00 – 22:00</span>
                </div>
            </div>
            <div class="footer-content">
                <span class="footer-title">Follow Us</span>
                <div class="footer-links">
                    <a href="https://www.instagram.com/zilver_patisserie/" target="_blank">Instagram</a>
                    <a href="https://www.facebook.com/p/Zilver-Patisserie-61578572153925/" target="_blank">Facebook</a>
                    <a href="https://www.tiktok.com/@zilver.patisserie" target="_blank">TikTok</a>
                </div>
            </div>
            <div class="signature">engineered by chris pappas</div>
        </footer>
    </div>

    <script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js"></script>
    <script>
        const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);

        const menuBtn = document.getElementById('menu-btn');
        const dropdown = document.getElementById('dropdown-menu');
        menuBtn.addEventListener('click', () => {
            dropdown.classList.toggle('active');
            menuBtn.style.transform = dropdown.classList.contains('active') ? 'rotate(90deg)' : 'rotate(0deg)';
        });
    </script>
      </body>
      </html>
    `
        }
    }, void 0, false, {
        fileName: "[project]/pages/index.js",
        lineNumber: 3,
        columnNumber: 5
    }, this);
}
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/pages/index.js [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/pages/index.js [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if ("TURBOPACK compile-time truthy", 1) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}),
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/pages/index\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/pages/index.js [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__0drlkvz._.js.map