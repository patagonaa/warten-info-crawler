export enum DataType {
    JsonObject,
    MinusSignSeperated
}

export interface Site {
    name: string;
    displayName: string;
    url: string;
    dataType: DataType;
};

export interface WaitCircleData {
    name: string;
    waitTimeSeconds: number | null;
    visitorCount: number;
    nextCalls?: string[];
}