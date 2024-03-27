import apiList from '~/service/apiList'

/* eslint-disable no-console */
export default function ({ $axios, redirect, store }, inject) {
  const apiModules = {}

  // const api = $axios.create({
  //   baseURL: process.env.API_URL,
  // })

  $axios.setBaseURL(process.env.API_URL)

  $axios.onRequest((config) => {
    // console.log('Making request to ' + config.url)

    config.params = {
      key: process.env.FIREBASE_API_KEY,
    }
    // console.log(config)

    return config
  })

  $axios.onError((error) => {
    const code = parseInt(error.response && error.response.status)
    const statusText = error.response.statusText
    console.log(error.response)

    if (code === 400) {
      // redirect("/400")
      console.log('error', code)
    }

    if (code === 401 && statusText === 'Unauthorized') {
      store.dispatch('exchangeToken')
    }
  })

  apiModules.apiList = apiList($axios)
  inject('api', apiModules)
}
