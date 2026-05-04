import React from 'react'
import {delSumAction, setSumAction, useData, useSum} from "./slices/dataSlice";
import './App.css'
import {useDispatch} from "react-redux";
import {GetData} from "./getData";

export default function ShoppingCart(){
    const dispatch = useDispatch()
    GetData()  // вызов хука
    const sum = useSum()
    const data = useData()
    return(
        <div>
            <div className="large"> Сумма заказа: { sum }</div>
            {
                data.map((good) =>
                    <div key={good.id}>
                        <p>
                        { good.title }
                        </p>
                        <p> Цена -
                            { good.price }
                        </p>
                        <button onClick={ () => {
                            dispatch(setSumAction( good.price ))
                            }}>
                            Добавить
                        </button>
                    </div>
                )
            }
            <button onClick={() => {
                dispatch(delSumAction())
            }
            }>
                Обнулить
            </button>
        </div>
    )
}