import * as github from "@actions/github";
import * as core from "@actions/core";
import fetch from "node-fetch";
import {exec} from "@actions/exec";

const {ID_TICKET, OAUTH_TOKEN, X_ORG_ID} = process.env;

const makeMeImage = async () => {
    try {
        const regex = new RegExp(/[0-9]+.[0-9]+.[0-9]+/gm);
        if (regex.test(github.context.ref)) {
            const relNumber = github.context.ref.match(regex).shift();

            await exec('docker', ['build', '-t', `rc:${relNumber}`,'.']);

            core.info('image create')

            await fetch(`https://api.tracker.yandex.net/v2/issues/${ID_TICKET}/comments`, {
                method: "PATCH",
                headers: {
                    Authorization: `OAuth ${OAUTH_TOKEN}`,
                    "X-Org-ID": X_ORG_ID,
                },
                body: JSON.stringify({
                    text: `Собрали образ в тегом rc:${relNumber}`
                })
            });

            core.info('say about in comment')

        }
    } catch (e) {
        core.setFailed(e.message)
    }
}
makeMeImage().then(_ => {
    core.info('image create end')
})