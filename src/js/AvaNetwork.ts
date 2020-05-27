let network_id = 0;

class AvaNetwork{
    name: string;
    id: number;
    protocol: string;
    port: number;
    ip: string;
    networkId: number;
    chainId: string;
    url: string;
    explorerUrl: string|undefined;

    constructor(name: string, url:string, networkId: number, chainId: string, explorerUrl?: string) {
        this.id = network_id++;
        this.name = name;
        this.explorerUrl = explorerUrl;
        this.protocol = 'http';
        this.port = 9650;
        this.ip='localhost';
        this.url = url;

        this.updateURL(url);

        // let split = url.split('://');
        //
        // this.protocol = split[0];
        //
        // // port is set
        // if(split[1].includes(':')){
        //     let urlSplit = split[1].split(':');
        //     let ip = urlSplit[0];
        //     let port = urlSplit[1];
        //
        //     this.ip = ip;
        //     this.port = parseInt(port);
        // }else{
        //     this.ip = split[1];
        //     if(this.protocol === 'http'){
        //         this.port = 80;
        //     }else{
        //         this.port = 443;
        //     }
        // }
        this.networkId = networkId;
        this.chainId = chainId;
    }

    updateURL(url: string){
        let split = url.split('://');

        this.protocol = split[0];

        // port is set
        if(split[1].includes(':')){
            let urlSplit = split[1].split(':');
            let ip = urlSplit[0];
            let port = urlSplit[1];

            this.ip = ip;
            this.port = parseInt(port);
        }else{
            this.ip = split[1];
            if(this.protocol === 'http'){
                this.port = 80;
            }else{
                this.port = 443;
            }
        }
    }
    getFullURL(){
        return `${this.protocol}://${this.ip}:${this.port}`;
    }
}


export {AvaNetwork};
