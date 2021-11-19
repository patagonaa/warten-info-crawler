import fetch from 'node-fetch';
import { DataProvider } from './getData';
import { Site, DataType } from './models';
import { convertData } from './convertData';

const INFLUX_SERVER = process.env.INFLUX_SERVER || "http://localhost:8086";
const INFLUX_DATABASE = process.env.INFLUX_DATABASE || 'warten-info';
const INFLUX_MEASUREMENT_NAME = 'waittimes';
const CRAWL_INTERVAL_MS = process.env.CRAWL_INTERVAL_MS ? parseInt(process.env.CRAWL_INTERVAL_MS) : (5 * 60 * 1000);

const sites: Site[] = [
    {
        name: 'buergeramt-heilbronn',
        displayName: 'Bürgeramt Heilbronn',
        url: 'https://warten.info/stadt-heilbronn-bb/get.php?option=values',
        dataType: DataType.JsonObject
    },
    {
        name: 'buergeramt-heilbronn-boeckingen',
        displayName: 'Bürgeramt Heilbronn-Böckingen',
        url: 'https://warten.info/stadt-heilbronn-bb-boeckingen/get.php?option=values',
        dataType: DataType.JsonObject
    },
    {
        name: 'landratsamt-kitzingen',
        displayName: 'Landratsamt Kitzingen',
        url: 'https://warten.info/lra-kitzingen/get.php?option=values',
        dataType: DataType.JsonObject
    },
    {
        name: 'buergerbuero-bottrop',
        displayName: 'Bürgerbüro Bottrop',
        url: 'https://warten.info/stadtbottrop/get.php?option=values',
        dataType: DataType.MinusSignSeperated
    },
    {
        name: 'landratsamt-regen',
        displayName: 'Landratsamt Regen',
        url: 'https://warten.info/lra-regen/get.php?option=values',
        dataType: DataType.JsonObject
    },
    {
        name: 'ele-gelsenkirchen',
        displayName: 'ELE-Center Gelsenkirchen',
        url: 'https://warten.info/ele-gel/get.php?option=values',
        dataType: DataType.JsonObject
    },
    {
        name: 'ele-bottrop',
        displayName: 'ELE-Center Bottrop',
        url: 'https://warten.info/ele-bo/get.php?option=values',
        dataType: DataType.JsonObject
    },
    {
        name: 'kfz-zul-ammerland',
        displayName: 'KFZ-Zulassungsstelle Landkreis Ammerland',
        url: 'https://warten.info/lk-ammerland-zul/get.php?option=values',
        dataType: DataType.JsonObject
    },
    {
        name: 'buergerbuero-schwerin',
        displayName: 'Bürgerbüro Schwerin',
        url: 'https://warten.info/schwerin/get.php?option=values',
        dataType: DataType.MinusSignSeperated
    },
    {
        name: 'stadtverwaltung-huerth',
        displayName: 'Stadtverwaltung Hürth',
        url: 'https://napp.kdvz-frechen.de/module/huerth/wartezeit/get.php?option=values',
        dataType: DataType.JsonObject
    },
    {
        name: 'buergerservice-halle-saale-marktplatz',
        displayName: 'Bürgerservicestelle Halle (Saale) Marktplatz',
        url: 'https://ncu.halle.de/wartezeit/marktplatz/get.php?option=values',
        dataType: DataType.JsonObject
    },
    {
        name: 'buergerservice-halle-saale-stadion',
        displayName: 'Bürgerservicestelle Halle (Saale) Am Stadion',
        url: 'https://ncu.halle.de/wartezeit/neustadt/get.php?option=values',
        dataType: DataType.JsonObject
    },
    {
        name: 'auslaenderbehoerde-halle-saale',
        displayName: 'Ausländerbehörde Halle (Saale)',
        url: 'https://ncu.halle.de/wartezeit/ausl/get.php?option=values',
        dataType: DataType.JsonObject
    },
    {
        name: 'standesamt-halle-saale',
        displayName: 'Standesamt Halle (Saale)',
        url: 'https://ncu.halle.de/wartezeit/standesamt/get.php?option=values',
        dataType: DataType.JsonObject
    },
    {
        name: 'zulassungsstelle-kreis-dithmarschen',
        displayName: 'Zulassungsstelle Kreis Dithmarschen',
        url: 'https://termin-dithmarschen.pbskg.de/warten/get.php?option=values',
        dataType: DataType.JsonObject
    },
    {
        name: 'buergerbuero-wuerzburg',
        displayName: 'Bürgerbüro Stadt Würzburg',
        url: 'https://warten.info/wuerzburg/get.php?option=values',
        dataType: DataType.JsonObject
    },
    {
        name: 'kfz-zulassungsstelle-viersen',
        displayName: 'KFZ-Zulassungsstelle Viersen',
        url: 'https://warten.info/kreis-viersen/get.php?option=values',
        dataType: DataType.JsonObject
    },
    {
        name: 'landratsamt-fuerstenfeldbruck',
        displayName: 'Landratsamt Fürstenfeldbruck',
        url: 'https://warten.info/lra-fuerstenfeldbruck/get.php?option=values',
        dataType: DataType.JsonObject
    },
    {
        name: 'kfz-zulassungsstelle-lk-vechta-vechta',
        displayName: 'Landkreis Vechta - KFZ-Zulassungsstelle Vechta',
        url: 'https://warten.info/lkvechta-zul-vechta/get.php?option=values',
        dataType: DataType.JsonObject
    },
    {
        name: 'kfz-zulassungsstelle-lk-vechta-damme',
        displayName: 'Landkreis Vechta - KFZ-Zulassungsstelle Damme',
        url: 'https://warten.info/lkvechta-zul-damme/get.php?option=values',
        dataType: DataType.JsonObject
    },
    {
        name: 'kfz-zulassungsstelle-lk-cuxhaven-cuxhaven',
        displayName: 'Landkreis Cuxhaven - KFZ-Zulassungsstelle Cuxhaven',
        url: 'https://warten.info/lk-cuxhaven-zul/get.php?option=values',
        dataType: DataType.MinusSignSeperated
    }
];

let dataProvider = new DataProvider();


async function crawlAll() {
    try {
        let lines: string[] = [];
        let startTime = Date.now();
        for (const site of sites) {
            try {
                let siteLines = await crawl(site);
                lines.push(...siteLines);
            } catch (error) {
                console.error(`error while crawling ${site.name}:`, error);
            }
        }
        console.info('crawled', sites.length, 'sites in', Math.round(Date.now() - startTime), 'ms');
        //console.log(lines);
        console.info('sending values to Influx...')
        startTime = Date.now();
        await sendValues(lines);
        console.info('sent', lines.length, 'lines in', Math.round(Date.now() - startTime), 'ms');
    } catch (error) {
        console.error(error);
    }
}

async function crawl(site: Site) {
    console.info("crawling", site.name);
    let data = await dataProvider.getData(site);
    let lines = convertData(INFLUX_MEASUREMENT_NAME, site, data);
    return lines;
}

async function sendValues(lines: string[]) {
    let response = await fetch(`${INFLUX_SERVER}/write?db=${INFLUX_DATABASE}`, { method: 'POST', body: lines.join('\n') });
    if (response.ok) {
        console.info("successfully transmitted values");
    } else {
        console.error('error while transmitting values: HTTP', response.status);
        console.error(await response.text());
    }
}

setInterval(() => crawlAll(), CRAWL_INTERVAL_MS);
crawlAll();