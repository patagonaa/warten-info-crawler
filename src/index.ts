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
        name: 'buergerbuero-dueren',
        displayName: 'Bürgerbüro Düren',
        url: 'https://terminmanagement.regioit-aachen.de/dueren/mobile_markt/get.php?option=values&sid=0',
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
        name: 'kfz-zul-ruesselsheim',
        displayName: 'KFZ-Zulassungsstelle Rüsselsheim',
        url: 'https://warten.info/gg-zul-rue/get.php?option=values',
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
        name: 'stva-lk-leer',
        displayName: 'Straßenverkehrsamt Landkreis Leer',
        url: 'http://netappoint.lkleer.de/warten/get.php?option=values',
        dataType: DataType.MinusSignSeperated
    },
    {
        name: 'stva-aachen-fuehrerschein',
        displayName: 'Straßenverkehrsamt Aachen Fuehrerscheinangelegenheiten',
        url: 'https://terminmanagement.regioit-aachen.de/sr_aachen/mobile_srac_stva/get.php?option=values&sid=0',
        dataType: DataType.JsonObject
    },
    {
        name: 'stva-aachen-haendler',
        displayName: 'Straßenverkehrsamt Aachen Haendlerwartekreis',
        url: 'https://terminmanagement.regioit-aachen.de/sr_aachen/mobile_srac_stva/get.php?option=values&sid=1',
        dataType: DataType.JsonObject
    },
    {
        name: 'stva-aachen-schnellschalter',
        displayName: 'Straßenverkehrsamt Aachen Schnellschalter',
        url: 'https://terminmanagement.regioit-aachen.de/sr_aachen/mobile_srac_stva/get.php?option=values&sid=2',
        dataType: DataType.JsonObject
    },
    {
        name: 'stva-aachen-zulassungsangelegenheiten',
        displayName: 'Straßenverkehrsamt Aachen Zulassungsangelegenheiten',
        url: 'https://terminmanagement.regioit-aachen.de/sr_aachen/mobile_srac_stva/get.php?option=values&sid=3',
        dataType: DataType.JsonObject
    },
    {
        name: 'stva-aachen-haendlerwartekreis-klein',
        displayName: 'Straßenverkehrsamt Aachen Haendlerwartekreis-Klein',
        url: 'https://terminmanagement.regioit-aachen.de/sr_aachen/mobile_srac_stva/get.php?option=values&sid=4',
        dataType: DataType.JsonObject
    },
    {
        name: 'buergerservice-aachen-bahnhofplatz',
        displayName: 'Bürgerservice Aachen Bahnhofplatz',
        url: 'https://terminmanagement.regioit-aachen.de/aachen/mobile_bahnhofplatz/get.php?option=values',
        dataType: DataType.MinusSignSeperated
    },
    {
        name: 'buergerbuero-emden',
        displayName: 'Bürgerbüro Emden',
        url: 'https://termine.emden.de/wartezeit/get.php?option=values',
        dataType: DataType.JsonObject
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
        name: 'buergerbuero-juelich',
        displayName: 'Bürgerbüro Stadt Jülich',
        url: 'https://napp.kdvz-frechen.de/module/juelich/wartezeit/get.php?option=values',
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
        dataType: DataType.JsonObject
    }
];

let dataProvider = new DataProvider();


async function crawlAll() {
    try {
        let lines: string[] = [];
        for (const site of sites) {
            let siteLines = await crawl(site);
            lines.push(...siteLines);
        }
        //console.log(lines);
        await sendValues(lines);
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