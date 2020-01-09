import { Site, WaitCircleData } from "./models";
import { getLine } from "./influx";

export function convertData(measurementName: string, site: Site, siteData: WaitCircleData[]) {
    let lines: string[] = [];
    for (const circleData of siteData) {
        let tags = {
            siteName: site.name,
            siteDisplayName: site.displayName,
            circleName: circleData.name,
        };
        let values = {
            visitorCount: circleData.visitorCount,
            waitTimeSecondsRaw: circleData.waitTimeSeconds,
            waitTimeSeconds: (circleData.visitorCount == 0 || circleData.waitTimeSeconds == null) ? 0 : circleData.waitTimeSeconds,
            nextCallCount: circleData.nextCalls == null ? null : circleData.nextCalls.length
        };

        lines.push(getLine(measurementName, tags, values));
    }

    return lines;
}