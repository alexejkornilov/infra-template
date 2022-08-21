import * as github from "@actions/github";
import * as core from "@actions/core";
import fetch from 'node-fetch';
import {exec} from "@actions/exec";

const {ID_TICKET, OAUTH_TOKEN, X_ORG_ID} = process.env;

const runForestRun = async () => {
    try {
        const regex = new RegExp(/[0-9]+.[0-9]+.[0-9]+/gm);
        if (regex.test(github.context.ref)) {
            const relNumber = github.context.ref.match(regex).shift();

            const currentMaintenance = relNumber.split('.').pop();
            const prevMaintenance = currentMaintenance - 1;

            const commitLogFilter = Number(currentMaintenance) === 1 ? `rc-0.0.${currentMaintenance}` : `rc-0.0.${prevMaintenance}...rc-0.0.${currentMaintenance}`

            const includeCommits = getCommitLog(['log', '--pretty=format:"%H %an %s"', commitLogFilter]).replace(/"/g, '');

            core.info('get message log')
            const currentDate = getFormatData(new Date());

            const pushName = github.context.payload.pusher?.name;

            const summary = `Релиз №${relNumber} от ${currentDate}`;
            const description = `ответственный за релиз ${pushName}\n\nкоммиты, попавшие в релиз:${includeCommits}`

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

            core.info('update ticket')

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

const getCommitLog = async (args) => {
    let result = '';
    let resultError = '';

    await exec('git', args, {
        listeners: {
            stdout: (data) => {
                result += data.toString();
            },
            stderr: (data) => {
                resultError += data.toString();
            },
        }
    });

    if (resultError !== '') {
        core.setFailed(resultError)
    }

    return result;
}
runForestRun().then(_ => {
    console.log('ticket must update')
    core.info('ticket must update')

})
