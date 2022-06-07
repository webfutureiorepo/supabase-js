import crossFetch, { Headers as CrossFetchHeaders } from 'cross-fetch'

type Fetch = typeof fetch

export const resolveFetch = (customFetch?: Fetch): Fetch => {
  let _fetch: Fetch
  if (customFetch) {
    _fetch = customFetch
  } else if (typeof fetch === 'undefined') {
    _fetch = crossFetch as unknown as Fetch
  } else {
    _fetch = fetch
  }
  return (...args) => _fetch(...args)
}

export const resolveHeadersConstructor = () => {
  if (typeof Headers === 'undefined') {
    return CrossFetchHeaders
  }

  return Headers
}

export const fetchWithAuth = (
  getAccessToken: () => Promise<string | null>,
  customFetch?: Fetch
): Fetch => {
  const fetch = resolveFetch(customFetch)
  const HeadersConstructor = resolveHeadersConstructor()

  return async (input, init) => {
    const accessToken = await getAccessToken()
    let headers = new HeadersConstructor(init?.headers)

    if (!headers.has('Authorization') && accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }

    return fetch(input, { ...init, headers })
  }
}
