import { Outlet, NavLink , Navigate} from "react-router-dom"
import "../../styles/global.css"
// import { useAppSelector } from "../../hooks/useAppSelector"
import { useDispatch } from "react-redux"
// import { increment, decrement } from "../../features/auth/authSlice"
import { fetchUser } from "../../features/cart/cartSlice"
// import { store } from "../../app/store"
import { useGetAllPostsQuery, useLazyGetAllPostsQuery } from "../../app/apiSlice"
import type { AppDispatch } from "../../app/store"
// import { useId } from "react"


function Dashboard({ isAuthenticated, set }: { isAuthenticated: boolean, set: React.Dispatch<React.SetStateAction<boolean>> }) {
  // const {user, loading, error  } = useAppSelector((state) => state.users)
  const dispatch = useDispatch<AppDispatch>()
  const { data, isLoading, error } = useGetAllPostsQuery(undefined);
  const [trigger, {data: $data, isLoading: $isLoading, error:$error}] = useLazyGetAllPostsQuery()
  const handleFetch = async () => {
    trigger(undefined);

     
    // try {
    //   const result = await dispatch(fetchUser("")).unwrap()
    //   console.log("fetched user:", result)
    // } catch (error) {
    //   console.error(error)
    // }
  }
  return isAuthenticated ? (<>
    <div>Dashboard</div>
    <NavLink to="/dashboard/product" end className={({ isActive }) => isActive ? "active-link" : ""}>products</NavLink>
    <NavLink to="/dashboard/product/analytics">analytics</NavLink>
    <button onClick={() => set(false)}>Click Me</button>
    <button type="button" onClick={handleFetch}>Fetch User</button>
    {isLoading && <p>Loading...</p>}
    {data && [...data.map(({title, id}: {title: string, id: number})=> <p key={id}>{title} </p>)]}
    {error && <p>{`an error occured`}</p>}

    {/* <button type="button" onClick={() => dispatch(decrement())}>decrement</button> */}
    <Outlet />
  </>
  ) : <Navigate to={"/"} />
  
}

export default Dashboard