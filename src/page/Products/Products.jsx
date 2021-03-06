import React, { useEffect, useState } from 'react'
import Banner from '../../assets/img/banner.jpg'
import { useNavigate, useParams } from 'react-router-dom'
import './products.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { useSelector, useDispatch } from 'react-redux'
import foodApi from '../../api/foodApi'
import { setAllFood } from '../../redux/action/food'
import ListProducts from '../../components/ListProducts/ListProducts'
import Loader from '../../components/Loader/Loader'
import ProductSidebar from '../../components/ProductSidebar/ProductSidebar'
import { useLocation } from 'react-router-dom'


const Products = () => {
    const param = useParams().cate
    const { search, pathname } = useLocation()
    const navigate = useNavigate()

    const listData = useSelector(state => state.foods.list)
    const dispatch = useDispatch()

    const [searchVal, setSearchVal] = useState('')

    const [loader, setLoader] = useState(true)

    const [activeBtn, setActiveBtn] = useState(false)

    useEffect(() => {
        const data = getData()
        return data
    }, [param, search])

    const getData = async () => {
        const res = search ? await foodApi.getFilter(search, pathname.split('/')[2]) : await foodApi.getByCate(param)
        const filterData = getUnique(res, 'id')
        dispatch(setAllFood(filterData))
        window.scrollTo(0, 0)
        setTimeout(() => {
            setLoader(false)
        }, 2000)
    }

    const getUnique = (arr, comp) => {

        const unique = arr
            .map(e => e[comp])

            // store the keys of the unique objects
            .map((e, i, final) => final.indexOf(e) === i && i)

            // eliminate the dead keys & store unique objects
            .filter(e => arr[e]).map(e => arr[e]);

        return unique;
    }

    window.onscroll = () => {
        if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
            setActiveBtn(true)
        }
        else {
            setActiveBtn(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchVal.length > 0) {
            navigate(`/menu/our-foods?q=${searchVal}`)
        }
    }

    return (
        <div className='Products'>
            {loader === true &&
                <Loader />
            }
            <div className="Products__banner">
                <img src={Banner} alt="" />
            </div>
            <div className="Products__menu">
                <div className="container">
                    <ProductSidebar param={param} setLoader={setLoader} />
                    <div className="Products__menu-foods">
                        <div className="search-form">
                            <form className="form" onSubmit={(e) => handleSearch(e)}>
                                <input type="text" placeholder='Search' value={searchVal} onChange={(e) => setSearchVal(e.target.value)} />
                                <button type='submit'>
                                    <FontAwesomeIcon icon={faSearch} />
                                </button>
                            </form>
                        </div>
                        <ListProducts data={listData} />
                    </div>
                    <div className="btn-scroll"></div>
                </div>
            </div>
        </div>
    )
}

export default Products
