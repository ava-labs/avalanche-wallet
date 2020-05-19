let network_id = 0;

class AvaNetwork{
    id: number;
    constructor(protocol:string = "http", ip: string, port: number) {
        this.id = network_id++;
    }
}


export {AvaNetwork};
