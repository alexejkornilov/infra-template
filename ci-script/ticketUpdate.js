import * as github from "@actions/github";
import * as core from "@actions/core";
import fetch from 'node-fetch';

const {ID_TICKET, OAUTH_TOKEN, X_ORG_ID} = process.env;

const runForestRun = async () => {
    try {
        const regex = new RegExp(/[0-9]+.[0-9]+.[0-9]+/gm);
        if (regex.test(github.context.ref)) {
            const relNumber = github.context.ref.match(regex).shift();

            const currentMaintenance = relNumber.split('.').pop();
            const prevMaintenance = currentMaintenance - 1;

            const currentDate = getFormatData(new Date());

            const pushName = github.context.payload.pusher?.name;

            const summary = `Релиз №${relNumber} от ${currentDate}`;
            const description = `ответственный за релиз ${pushName}\n\nкоммиты, попавшие в релиз:`


            await fetch(`https://api.tracker.yandex.net/v2/issues/${ID_TICKET}`, {
                method: "PATCH",
                headers: {
                    Authorization: `OAuth ${OAUTH_TOKEN}`,
                    "X-Org-ID": X_ORG_ID,
                },
                body: JSON.stringify({
                    summary,
                    description,
                })
            });
        }


    } catch (e) {
        core.setFailed(e.message)
    }
}

const getFormatData = (date) => {
    const year = date.getFullYear();

    let month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    let day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    return month + '/' + day + '/' + year;
}
runForestRun().then(_ => console.log('ticket must update'))
console.log(github.context.ref)