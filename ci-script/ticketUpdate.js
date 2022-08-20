import * as github from "@actions/github";

const { ID_TICKET, OAUTH_TOKEN, X_ORG_ID } = process.env;
console.log(github.context.ref)