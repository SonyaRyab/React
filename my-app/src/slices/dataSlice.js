import { createSlice } from "@reduxjs/toolkit"
import { useSelector } from "react-redux";

const dataSlice = createSlice({
    name: "data",
    // в initialState мы указываем начальное состояние нашего глобального хранилища
    initialState: {
        Data: [], 
        SumShoppingCart: 0,
    },
    // Редьюсеры в слайсах мутируют состояние и ничего не возвращают наружу
    reducers: {
        setData(state, {payload}) {  // изменяем состояние на полученные данные
            state.Data = payload
        },
        setSum(state, {payload}) {  // суммируем цены выбранных товаров
            state.SumShoppingCart += payload
        },
        delSum(state) {  // обнуляем сумму выбранных товаров
            state.SumShoppingCart = 0
        }
    }
})

export const useData = () =>
    useSelector((state) => state.ourData.Data)

export const useSum = () =>
    useSelector((state) => state.ourData.SumShoppingCart)

export const {
    setData: setDataAction,
    setSum: setSumAction,
    delSum: delSumAction
} = dataSlice.actions

export default dataSlice.reducer