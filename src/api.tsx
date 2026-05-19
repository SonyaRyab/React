import { dest_api } from "./target_config"
export const getFiltersByTitle = async (title = ''): Promise<FilterPropWithQueue> =>{
return  fetch(dest_api + '/filters?' + new URLSearchParams({title:title}), {method: "GET", credentials: 'include'})
}