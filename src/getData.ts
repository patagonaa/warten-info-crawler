import { DataType, Site, WaitCircleData } from "./models";
import fetch from 'node-fetch';

export class DataProvider {
    public parseWaitTime(waitTime: string): number | null {
        if (waitTime == null || waitTime === '0:NAN')
            return 0;
        let matches = waitTime.match(/^(?:(\d+):)?(\d+):(\d+)$/);
        if (matches == null)
            return null;

        let hours = parseInt(matches[1]) || 0;
        let minutes = parseInt(matches[2]);
        let seconds = parseInt(matches[3]);

        return hours * 60 * 60 + minutes * 60 + seconds;
    }

    public async getData(site: Site) {
        let data = await fetch(site.url, { method: 'GET' });

        let waitCircleData: WaitCircleData[] = [];
        switch (site.dataType) {
            case DataType.JsonObject:
                {
                    let text = (await data.text()).trim();
                    let json: any;
                    try {
                        json = JSON.parse(text);
                    } catch (error) {
                        console.error('error in json', '"' + text + '"', "from site", site.name);
                        throw error;
                    }
                    let waitCircles = Object.keys(json.waitcircles);
                    let waitTimes: { [circle: string]: string } = json.waitingtime;
                    let visitors: { [circle: string]: string } = json.visitorcount;

                    for (const waitCircle of waitCircles) {
                        let nextCalls: null | string[] = null;

                        if (json.next_calls != null) {
                            if (json.next_calls[waitCircle] instanceof Array) {
                                nextCalls = json.next_calls[waitCircle];
                            } else {
                                nextCalls = [];
                            }
                        }

                        waitCircleData.push({
                            name: waitCircle,
                            waitTimeSeconds: this.parseWaitTime(waitTimes[waitCircle]),
                            visitorCount: parseInt(visitors[waitCircle] ?? "0"),
                            nextCalls: nextCalls
                        });
                    }
                    break;
                }
            case DataType.MinusSignSeperated:
                {
                    let text = (await data.text()).trim();
                    let dataItems = text.split('----------');
                    if (dataItems.length < 4)
                        return;

                    let waitCircles = Object.keys(JSON.parse(dataItems[0]));
                    let waitTimes: { [circle: string]: string } = JSON.parse(dataItems[1]);
                    let visitors: { [circle: string]: string } = JSON.parse(dataItems[2]);

                    for (const waitCircle of waitCircles) {
                        waitCircleData.push({
                            name: waitCircle,
                            waitTimeSeconds: this.parseWaitTime(waitTimes[waitCircle]),
                            visitorCount: parseInt(visitors[waitCircle])
                        });
                    }
                    break;
                }
            default:
                throw 'Invalid Data Type';
        }

        return waitCircleData;
    }
}

