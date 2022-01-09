import axios from 'axios'

let network_id: number = 0

class AvaNetwork {
    name: string
    id: number
    protocol: string
    port: number
    ip: string
    networkId: number
    // chainId: string;
    url: string
    explorerUrl: string | undefined
    explorerSiteUrl: string | undefined
    readonly: boolean
    withCredentials = false
    // fee: BN

    constructor(
        name: string,
        url: string,
        networkId: number,
        explorerUrl?: string,
        explorerSiteUrl?: string,
        readonly = false
    ) {
        this.id = network_id++
        this.name = name
        this.explorerUrl = explorerUrl
        this.explorerSiteUrl = explorerSiteUrl
        this.protocol = 'http'
        this.port = 9650
        this.ip = 'localhost'
        this.url = url
        this.updateURL(url)
        this.networkId = networkId
        // this.chainId = chainId;
        this.readonly = readonly
        // this.fee = new BN(0);
    }

    async testConnection(credentials = false) {
        let resp = await axios
            .post(
                this.url + '/ext/info',
                {
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'info.getNetworkID',
                },
                {
                    withCredentials: true,
                }
            )
            .catch((err) => {
                return false
            })

        return true
    }

    // Checks if this network endpoint allows credentials
    async updateCredentials() {
        try {
            let res = await axios.post(
                this.url + '/ext/info',
                {
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'info.getNetworkID',
                },
                {
                    withCredentials: true,
                }
            )
            this.withCredentials = true
        } catch (e) {
            this.withCredentials = false
        }
    }

    updateURL(url: string) {
        let split: string[] = url.split('://')

        this.protocol = split[0]

        // port is set
        if (split[1].includes(':')) {
            let urlSplit: string[] = split[1].split(':')
            let ip: string = urlSplit[0]
            let port: string = urlSplit[1]

            this.ip = ip
            this.port = parseInt(port)
        } else {
            this.ip = split[1]
            if (this.protocol === 'http') {
                this.port = 80
            } else {
                this.port = 443
            }
        }
    }
    getFullURL() {
        return `${this.protocol}://${this.ip}:${this.port}`
    }

    getWsUrlX(): string {
        let protocol = this.protocol === 'https' ? 'wss' : 'ws'
        return `${protocol}://${this.ip}:${this.port}/ext/bc/X/events`
    }

    getWsUrlC(): string {
        let protocol = this.protocol === 'https' ? 'wss' : 'ws'
        return `${protocol}://${this.ip}:${this.port}/ext/bc/C/ws`
    }
}

export { AvaNetwork }
