import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/batching";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/fields";
import "@pnp/sp/views";
import "@pnp/sp/content-types";
import "@pnp/sp/site-users/web";
import "@pnp/sp/items/get-all";

// import { graphfi, SPFx as graphSPFx } from "@pnp/graph";
// import { GraphFI } from "@pnp/graph/fi";
// import "@pnp/graph/teams";
// import "@pnp/graph/teams";
// import "@pnp/graph/planner";
// import "@pnp/graph/users";
// import "@pnp/graph/messages";

// SP:
// npm install @pnp/sp @pnp/nodejs @pnp/logging --save

// Graph:
// npm install @pnp/core @pnp/queryable @pnp/graph --save

var _sp: SPFI = null!;
// var _graph: GraphFI = null;

export const getSP = (context: any): SPFI => {
    if (_sp === null && context !== null) {
        _sp = spfi().using(SPFx(context));
    }
    // if (_graph === null && context != null) {
    //     _graph = graphfi().using(graphSPFx(context));
    // }
    return _sp;
};