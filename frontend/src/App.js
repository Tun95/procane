import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useContext, useEffect } from "react";
import "./theme style/dark.scss";
import MessengerCustomerChat from "react-messenger-customer-chat";
import Header from "./common/header/Header";
import HomeScreen from "./screens/homescreen/HomeScreen";
import Cart from "./common/cart/Cart";
import StoreScreen from "./screens/storescreen/StoreScreen";
import ProductDetailScreen from "./screens/productdetailscreen/ProductDetailScreen";
import WishlistScreen from "./screens/wishlistscreen/WishlistScreen";
import UserProfileScreen from "./screens/profilescreen/user profile/UserProfileScreen";
import VendorProfileScreen from "./screens/profilescreen/vendor profile/VendorProfileScreen";
import LoginScreen from "./screens/formscreens/loginscreen/LoginScreen";
import RegisterScreen from "./screens/formscreens/registerscreen/RegisterScreen";
import ContactScreen from "./screens/formscreens/contactscreen/ContactScreen";
import AccountVerifyScreen from "./screens/formscreens/accountverifyscreen/AccountVerifyScreen";
import VerifySuccessScreen from "./screens/formscreens/verifiedscreen/VerifiedScreen";
import UserList from "./admin/pages/list/user/UserList";
import VendorList from "./admin/pages/list/vendor/VendorList";
import Footer from "./common/footer/Footer";
import ProductEdit from "./admin/pages/edit/product/ProductEdit";
import UserEdit from "./admin/pages/edit/user/UserEdit";
import UserInfo from "./admin/pages/single/user/UserInfo";
import NewUser from "./admin/pages/new/user/NewUser";
import NewProduct from "./admin/pages/new/product/NewProduct";
import OurStoreScreen from "./screens/aboutscreen/ourstorescreen/OurStoreScreen";
import PrivacyScreen from "./screens/aboutscreen/privacyscreen/PrivacyScreen";
import TermScreen from "./screens/aboutscreen/termscreen/TermScreen";
import ScrollToTop from "./components/utilities/scroll to top/ScrollToTop";
import { Context } from "./context/Context";
// import MessengerCustomerChat from "react-messenger-customer-chat";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Brand,
  Category,
  Color,
  Price,
  Size,
} from "./admin/pages/new/filters/CreateFilters";
import ProtectedRoute from "./components/utilities/protectedRoute/ProtectedRoute";
import AdminRoute from "./components/utilities/protectedRoute/AdminRoute";
import TimeAgo from "javascript-time-ago";

import en from "javascript-time-ago/locale/en.json";
import ru from "javascript-time-ago/locale/ru.json";
import {
  BrandUpdate,
  CategoryUpdate,
  ColorUpdate,
  PriceUpdate,
  SizeUpdate,
} from "./admin/pages/edit/filters/FiterUpdate";
import { BannerUpdate } from "./admin/pages/edit/banner/BannerUpdate";
import { NewBanner } from "./admin/pages/new/banner/NewBanner";
import OtherScreen from "./admin/pages/others/others/Others";
import PasswordEmailResetScreen from "./screens/formscreens/passemailcreen/PasswordEmailResetScreen";
import PasswordResetFormScreen from "./screens/formscreens/passresetformscreen/PasswordResetFormScreen";
import CareerScreen from "./screens/aboutscreen/careerscreen/CareerScreen";
import OurCareScreen from "./screens/aboutscreen/ourcarescreen/OurCareScreen";
import BulkScreen from "./screens/customercarescreen/bulkscreen/BulkScreen";
import BuyInfoScreen from "./screens/customercarescreen/buyinfoscreen/BuyInfoScreen";
import ReturnScreen from "./screens/customercarescreen/returnscreen/ReturnScreen";
import ShippingScreen from "./screens/checkoutscreen/shippingscreen/ShippingScreen";
import ConfirmationScreen from "./screens/checkoutscreen/confirmation screen/ConfirmationScreen";
import PaymentScreen from "./screens/checkoutscreen/paymentscreen/PaymentScreen";
import FinishScreen from "./screens/checkoutscreen/finishscreen/FinishScreen";
import OrderHistoryScreen from "./screens/orderscreen/orderhistoryscren/OrderHistoryScreen";
import OrderDetailScreen from "./screens/orderscreen/orderdetailscreen/OrderDetailScreen";
import OrderlistScreen from "./admin/pages/list/order/main/OrderlistScreen";
import SellerRoute from "./components/utilities/protectedRoute/SellerRoute";
import ProductlistScreen from "./admin/pages/list/product/main/ProductListScreen";
import DashboardScreen from "./admin/pages/home/main/DashboardScreen";
import Settings from "./admin/pages/single/settings/Settings";
import VendorScreen from "./screens/formscreens/vendorscreen/VendorScreen";
import Application from "./admin/pages/single/application detail/Application";
import TrackScreen from "./screens/orderscreen/trackscreen/TrackScreen";
import ReactGA from "react-ga4";
import LoadingOverlayComponent from "./components/utilities/message loading/OverlayLoading";
import NotFoundScreen from "./components/utilities/404 error/PageNotFound";
import ThemeFaqScreen from "./screens/aboutscreen/faqscreen/ThemeFaqScreen";
import SellerProductEdit from "./seller/pages/edit/SellerProductEdit";
import SellerNewProduct from "./seller/pages/new/product/SellerNewProduct";
import SellerOrderListScreen from "./seller/pages/list/main/order/SellerOrderListScreen";
import SellerScreen from "./seller/pages/single/main/SellerScreen";
import SellerProductListScreen from "./seller/pages/list/main/product/SellerProductListScreen";
import SellerDashboard from "./seller/pages/dashboard/Dashboard";

TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(ru);

function App() {
  const { darkMode, state } = useContext(Context);
  const { settings } = state;
  const { messengerAppId, messengerPageId } =
    (settings &&
      settings
        .map((s) => ({
          messengerAppId: s.messengerAppId,
          messengerPageId: s.messengerPageId,
        }))
        .find(() => true)) ||
    {};

  ReactGA.initialize(process.env.REACT_APP_GOOGLE_TRACKING, {
    debug: true,
    titleCase: false,
    gaOptions: {
      userId: 123,
    },
  });

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <Router>
        <LoadingOverlayComponent>
          <ToastContainer />
          <ScrollToTop />
          <Header />

          <Routes>
            <Route path="*" element={<NotFoundScreen />} />
            <Route path="/" exact element={<HomeScreen />}></Route>
            <Route path="/cart" element={<Cart />}></Route>
            <Route path="/store" element={<StoreScreen />}></Route>
            <Route
              path="/product/:slug"
              element={<ProductDetailScreen />}
            ></Route>
            <Route
              path="/order-details/:id"
              element={<OrderDetailScreen />}
            ></Route>
            <Route
              path="/vendor-products/:id"
              element={<SellerScreen />}
            ></Route>

            {/* ABOUT US */}
            <Route path="/store-locations" element={<OurStoreScreen />}></Route>
            <Route path="/privacy-policy" element={<PrivacyScreen />}></Route>
            <Route path="/terms-and-conditons" element={<TermScreen />}></Route>
            <Route path="/careers" element={<CareerScreen />}></Route>
            <Route path="/our-cares" element={<OurCareScreen />}></Route>
            <Route path="/theme-faq" element={<ThemeFaqScreen />}></Route>

            {/* CUSTOMER CARES */}
            <Route path="/bulk-purchases" element={<BulkScreen />}></Route>
            <Route path="/how-to-buy" element={<BuyInfoScreen />}></Route>
            <Route path="/returns" element={<ReturnScreen />}></Route>

            {/* USER */}
            <Route
              path="/user-profile/:id"
              element={
                <ProtectedRoute>
                  <UserProfileScreen />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/vendor-profile/:id"
              element={<VendorProfileScreen />}
            ></Route>
            <Route
              path="/wish-list/:id"
              element={
                <ProtectedRoute>
                  <WishlistScreen />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/track-order"
              element={
                <ProtectedRoute>
                  <OrderHistoryScreen />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/track-shipment"
              element={
                <ProtectedRoute>
                  <TrackScreen />
                </ProtectedRoute>
              }
            ></Route>
            {/* USER */}

            {/* VALIDATION */}
            <Route path="/login" element={<LoginScreen />}></Route>
            <Route path="/register" element={<RegisterScreen />}></Route>
            <Route path="/contact" element={<ContactScreen />}></Route>
            <Route
              path="/forgot-password"
              element={<PasswordEmailResetScreen />}
            ></Route>
            <Route
              path="/:id/new-password/:token"
              element={<PasswordResetFormScreen />}
            ></Route>
            <Route
              path="/account-verification"
              element={<AccountVerifyScreen />}
            ></Route>
            <Route
              path="/verify-success/:id/:token"
              element={
                <ProtectedRoute>
                  <VerifySuccessScreen />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/application"
              element={
                <ProtectedRoute>
                  <VendorScreen />
                </ProtectedRoute>
              }
            ></Route>

            {/* VALIDATION */}

            {/* CHECKOUT */}
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <ShippingScreen />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/confirmation"
              element={<ConfirmationScreen />}
            ></Route>
            <Route
              path="/payment/:id"
              element={
                <ProtectedRoute>
                  <PaymentScreen />
                </ProtectedRoute>
              }
            ></Route>
            <Route path="/finish" element={<FinishScreen />}></Route>
            {/* CHECKOUT */}

            {/* ADMIN ROUTES */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <DashboardScreen />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <UserList />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/user/:id"
              element={
                <AdminRoute>
                  <UserInfo />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/user/new"
              element={
                <AdminRoute>
                  <NewUser />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/user/:id/edit"
              element={
                <AdminRoute>
                  <UserEdit />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/vendors"
              element={
                <AdminRoute>
                  <VendorList />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <ProductlistScreen />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/product/new"
              element={
                <AdminRoute>
                  <NewProduct />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/product/:id/edit"
              element={
                <AdminRoute>
                  <ProductEdit />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <OrderlistScreen />
                </AdminRoute>
              }
            ></Route>

            {/* FILTERS */}
            <Route
              path="/admin/new-category"
              element={
                <AdminRoute>
                  <Category />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/new-brand"
              element={
                <AdminRoute>
                  <Brand />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/new-size"
              element={
                <AdminRoute>
                  <Size />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/new-color"
              element={
                <AdminRoute>
                  <Color />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/new-price"
              element={
                <AdminRoute>
                  <Price />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/category/:id"
              element={
                <AdminRoute>
                  <CategoryUpdate />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/brand/:id"
              element={
                <AdminRoute>
                  <BrandUpdate />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/size/:id"
              element={
                <AdminRoute>
                  <SizeUpdate />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/price/:id"
              element={
                <AdminRoute>
                  <PriceUpdate />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/color/:id"
              element={
                <AdminRoute>
                  <ColorUpdate />
                </AdminRoute>
              }
            ></Route>
            {/* BANNER */}
            <Route
              path="/admin/new-banner"
              element={
                <AdminRoute>
                  <NewBanner />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/banner/:id"
              element={
                <AdminRoute>
                  <BannerUpdate />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <OtherScreen />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/settings/:id"
              element={
                <AdminRoute>
                  <Settings />
                </AdminRoute>
              }
            ></Route>
            <Route
              path="/admin/application-details/:id"
              element={
                <AdminRoute>
                  <Application />
                </AdminRoute>
              }
            ></Route>
            {/* ADMIN ROUTES */}

            {/* SELLER ROUTES */}
            <Route
              path="/vendor/dashboard"
              element={
                <SellerRoute>
                  <SellerDashboard />
                </SellerRoute>
              }
            ></Route>
            <Route
              path="/vendor/products"
              element={
                <SellerRoute>
                  <SellerProductListScreen />
                </SellerRoute>
              }
            ></Route>
            <Route
              path="/vendor/product/:id/edit"
              element={
                <SellerRoute>
                  <SellerProductEdit />
                </SellerRoute>
              }
            ></Route>
            <Route
              path="/vendor/product/new"
              element={
                <SellerRoute>
                  <SellerNewProduct />
                </SellerRoute>
              }
            ></Route>
            <Route
              path="/vendor/orders"
              element={
                <SellerRoute>
                  <SellerOrderListScreen />
                </SellerRoute>
              }
            ></Route>

            {/* SELLER ROUTES */}
          </Routes>

          <MessengerCustomerChat
            pageId={messengerPageId}
            appId={messengerAppId}
          />
          <Footer />
        </LoadingOverlayComponent>
      </Router>
    </div>
  );
}

export default App;
