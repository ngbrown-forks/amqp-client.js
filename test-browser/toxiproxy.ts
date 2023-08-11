export interface IProxyBody {
  name: string
  listen: string
  upstream: string
  enabled?: boolean
}

export interface IProxyResponse {
  name: string
  listen: string
  upstream: string
  enabled: boolean
}

export interface IGetProxiesResponse {
  [name: string]: IProxyResponse
}

export interface Proxies {
  [name: string]: Proxy
}

export class Toxiproxy {
  host: string
  constructor(host: string) {
    this.host = host
  }

  async createProxy(body: IProxyBody): Promise<Proxy> {
    const resp = await fetch(`${this.host}/proxies`, {
      method: "POST",
      body: JSON.stringify(body),
    })
    if (resp.status == 409) {
      throw new Error(`Proxy ${body.name} already exists`)
    } else if (resp.status != 201) {
      throw new Error(
        `Response status was not 201 Created: ${resp.status} ${resp.statusText}`
      )
    }
    const proxy = (await resp.json()) as IProxyResponse
    return new Proxy(this, proxy)
  }

  async getAll(): Promise<Proxies> {
    const resp = await fetch(`${this.host}/proxies`)
    if (resp.status !== 200) {
      throw new Error(
        `Response status was not 200 OK: ${resp.status} ${resp.statusText}`
      )
    }
    const body = (await resp.json()) as IGetProxiesResponse
    const proxies: Proxies = {}
    for (const name in body) {
      proxies[name] = new Proxy(this, body[name])
    }
    return proxies
  }
}

export default class Proxy {
  toxiproxy: Toxiproxy

  name: string
  listen: string
  upstream: string
  enabled: boolean

  constructor(toxiproxy: Toxiproxy, body: IProxyResponse) {
    this.toxiproxy = toxiproxy

    const { name, listen, upstream, enabled } = body
    this.name = name
    this.listen = listen
    this.upstream = upstream
    this.enabled = enabled
  }

  getHost() {
    return this.toxiproxy.host
  }

  getPath() {
    return `${this.getHost()}/proxies/${this.name}`
  }

  async remove(): Promise<void> {
    const response = await fetch(this.getPath(), {
      method: "DELETE",
    })
    if (response.status != 204) {
      throw new Error(
        `Response status was not 204 No Content: ${response.status} ${response.statusText}`
      )
    }
  }
}
