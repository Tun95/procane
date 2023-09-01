import bcrypt from "bcryptjs";

const data = {
  users: [
    {
      firstName: "Tunji",
      lastName: "Akande",
      email: "shopmate400@gmail.com",
      image:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687182438/dvez9uaxz53b0vfakide.jpg",
      password: bcrypt.hashSync("Akande95"),
      isAdmin: true,
      isBlocked: false,
      isSeller: true,
      affiliateCode: 0,
      isAccountVerified: true,
    },
    {
      firstName: "John",
      lastName: "Mathew",
      email: "mathew12@gmail.com",
      image:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687182438/dvez9uaxz53b0vfakide.jpg",
      password: bcrypt.hashSync("Mathew95"),
      isAdmin: false,
      isBlocked: false,
      affiliateCode: 1,
      isSeller: false,
      isAccountVerified: false,
    },
  ],
  products: [
    {
      name: "Bracelet Armchair Fendi",
      slug: "Bracelet Armchair Fendi Casa",
      keygen: "SKU BK3569",
      gender: [],
      category: [],
      size: ["32 Fit by 14 Fit"],
      color: [
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1686772607/pxdsmlnqamgzmphioqpg.png",
      ],
      price: 20,
      countInStock: 20,
      numSales: 0,
      discount: 10,
      brand: ["Office Chair"],
      image:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1686571535/ccnuzt8ieikazohiog9w.jpg",
      images: [
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1686747981/hqfxo8djjwtpaployoiq.png",
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1686748391/blni9nkafaoslvpwhwxp.png",
      ],
      desc: '<table style="border-collapse:collapse;width: 100%;"><tbody>\n<tr>\n\t<td style="width: 35.5051%;">HEIGHT</td><td style="width: 47.0588%;">Inches(34.6)</td><td style="width: 17.3375%;">CM(88)</td></tr>\n<tr>\n\t<td style="width: 41.1765%;">WIDTH</td><td style="width: 41.1765%;">Inches(17.7 x 89.4)</td><td style="width: 49.9226%;">CM(182 x227)</td></tr></tbody></table><p><span>Lorem ipsum dolor sit amet consectetur adipisicing elit.Consectetur neque, quidem harum tempore, laboriosam modi magnisapiente, illum pariatur dolorum nemo! Magnam quaerat ducimus,delectus vero ipsum facere quis ipsam fuga? Obcaecati odioporro, eveniet, ipsum quidem dolorum doloremque ea mollitiaaliquid nulla error temporibus eaque beatae soluta modiconsequatur tempore voluptatibus earum rerum facere,praesentium deserunt tenetur expedita. Ducimus.<br></span><br></p>',
      rating: 5,
      numReviews: 1,
      reviews: [],
      createdAt: "2023-06-12T12:09:23.258Z",
      updatedAt: "2023-06-18T16:39:21.842Z",
      __v: 8,
      flashdeal: true,
    },
    {
      name: "Single Sofa Chair",
      slug: "Single Sofa Chair",
      keygen: "",
      category: [],
      size: [],
      color: [],
      price: 600,
      countInStock: 20,
      numSales: 0,
      discount: null,
      brand: [],
      image:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687022292/pmcdkr4ehjcq5azmksqs.jpg",
      images: [],
      desc: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Auctor libero id et, in gravida. Sit diam duis mauris nulla cursus. Erat et lectus vel ut sollicitudin elit at amet.</p>",
      rating: 2.5,
      numReviews: 1,
      reviews: [],
      createdAt: "2023-06-17T17:20:21.196Z",
      updatedAt: "2023-06-18T16:42:10.480Z",
      __v: 1,
      flashdeal: true,
    },
    {
      name: "Chair without arm",
      slug: "Chair without arm",
      keygen: "",
      category: [],
      size: [],
      color: [],
      price: 500,
      countInStock: 20,
      numSales: 0,
      discount: null,
      brand: [],
      images: [],
      desc: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Auctor libero id et, in gravida. Sit diam duis mauris nulla cursus. Erat et lectus vel ut sollicitudin elit at amet.</p>",
      rating: 0,
      numReviews: 0,
      reviews: [],
      createdAt: "2023-06-17T17:22:15.197Z",
      updatedAt: "2023-06-18T16:42:27.781Z",
      __v: 0,
      image:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687024076/d0inm4xhgvlayccbltpi.jpg",
      flashdeal: true,
    },
    {
      flashdeal: false,
      name: "Chair",
      slug: "Chair-unknown",
      keygen: "SKU BK3569",
      category: [],
      size: [],
      color: [],
      price: 700,
      countInStock: 10,
      numSales: 0,
      discount: 50,
      brand: [],
      image:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687076443/yycsxuxjmn3q7cackkh0.jpg",
      images: [],
      desc: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Auctor libero id et, in gravida. Sit diam duis mauris nulla cursus. Erat et lectus vel ut sollicitudin elit at amet.</p>",
      rating: 0,
      numReviews: 0,
      reviews: [],
      createdAt: "2023-06-18T08:21:24.221Z",
      updatedAt: "2023-06-18T08:21:24.221Z",
      __v: 0,
    },
    {
      flashdeal: false,
      name: "Chair Table",
      slug: "Chair",
      keygen: "SKU BK3569",
      category: [],
      size: [],
      color: [],
      price: 500,
      countInStock: 10,
      numSales: 0,
      discount: 60,
      brand: [],
      image:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687076580/jrr8vyue9hdohp8jnlt4.jpg",
      images: [],
      desc: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Auctor libero id et, in gravida. Sit diam duis mauris nulla cursus. Erat et lectus vel ut sollicitudin elit at amet.</p>",
      rating: 0,
      numReviews: 0,
      reviews: [],
      createdAt: "2023-06-18T08:23:30.170Z",
      updatedAt: "2023-06-18T08:23:30.170Z",
      __v: 0,
    },
    {
      flashdeal: false,
      name: "Chair with arm",
      slug: "Chair with arm",
      keygen: "SKU BK3569",
      category: [],
      size: [],
      color: [],
      price: 800,
      countInStock: 10,
      numSales: 0,
      discount: 55,
      brand: [],
      image:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687076737/ptux77nwgz2gn3y3kpoc.jpg",
      images: [],
      desc: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Auctor libero id et, in gravida. Sit diam duis mauris nulla cursus. Erat et lectus vel ut sollicitudin elit at amet.</p>",
      rating: 0,
      numReviews: 0,
      reviews: [],
    },
    {
      flashdeal: false,
      name: "Chair without arms",
      slug: "Chair without arms",
      keygen: "SKU BK3569",
      category: [],
      size: [],
      color: [],
      price: 1000,
      countInStock: 10,
      numSales: 0,
      discount: 65,
      brand: [],
      image:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687076863/ib2cxbblmhyyz7efqngu.jpg",
      images: [],
      desc: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Auctor libero id et, in gravida. Sit diam duis mauris nulla cursus. Erat et lectus vel ut sollicitudin elit at amet.</p>",
      rating: 0,
      numReviews: 0,
      reviews: [],
    },
    {
      flashdeal: false,
      name: "Sataclable Arm Chair",
      slug: "Sataclable Arm Chair",
      keygen: "SKU BK3569",
      category: [""],
      size: [],
      color: [],
      price: 750,
      countInStock: 10,
      numSales: 0,
      discount: 75,
      brand: [],
      image:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687076988/f84iimyj5e3k4dzdfuyj.jpg",
      images: [],
      desc: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Auctor libero id et, in gravida. Sit diam duis mauris nulla cursus. Erat et lectus vel ut sollicitudin elit at amet.</p>",
      rating: 0,
      numReviews: 0,
      reviews: [],
    },
  ],
  banners: [
    {
      title: "Flower verse 50% off",
      background:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1686848034/hsr8nzjz7y3wi1h5lzc1.png",
      category: "Dinning Table",
      descriptions:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Auctor libero id et, in gravida. Sit diam duis mauris nulla cursus. Erat et lectus vel ut sollicitudin elit at amet.",
    },
    {
      title: "50% Off For Your First Shopping",
      background:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1686847287/jzlspyhgkwegtaxvmkai.png",
      category: "office chair",
      descriptions:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Auctor libero id et, in gravida. Sit diam duis mauris nulla cursus. Erat et lectus vel ut sollicitudin elit at amet.",
    },
    {
      title: "Shop With Confidence",
      background:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1686844702/prj99rsxuhl5buu2ohei.png",
      category: "office chair",
      descriptions:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Auctor libero id et, in gravida. Sit diam duis mauris nulla cursus. Erat et lectus vel ut sollicitudin elit at amet.",
    },
  ],
  categories: [
    {
      category: "Half Round Sofa",
      categoryImg:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687618056/dhnpmuobkqa1celdckik.png",
    },
    {
      category: "Foot Rest",
      categoryImg:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687618030/hhourhlfwv9fth5urla5.png",
    },
    {
      category: "Center Table",
      categoryImg:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687617301/pvbpzxpf4d4sbtgdzhrc.png",
    },
    {
      category: "Side Table",
      categoryImg:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687614419/teuxnuaceijwrwtfbmdx.png",
    },
    {
      category: "Chair with SS frame",
      categoryImg:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687021470/aspjmty0b26mi6oxcnku.png",
    },
    {
      category: "Stackable Chair",
      categoryImg:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687021396/kokvbdyb9qoihlhma2kc.png",
    },
    {
      category: "Table with SS base",
      categoryImg:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687021344/iyoblb2ltsxnwc6udc3y.png",
    },
    {
      category: "Table with wooden base",
      categoryImg:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687021304/tsgdfjawgnlmjzbrqbyl.png",
    },
    {
      category: "SS Table",
      categoryImg:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687021267/eahvhf8p0laty3z0y8nm.png",
    },
    {
      category: "Table with wooden top",
      categoryImg:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687021235/eoanvixxgzzvtqo2pzvc.png",
    },
    {
      category: "Wooden Table",
      categoryImg:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687021138/phyoo2oxku5rm1rqzkrt.png",
    },
    {
      category: "Coffee Table",
      categoryImg:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687021073/qmng45nlmso7l5nitika.png",
    },
    {
      category: "Round Table",
      categoryImg:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687009069/sf3fyyiqyqstylksigde.png",
    },
    {
      category: "Dinning Table",
      categoryImg:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687008971/fdxm0z42w7wjnhc5i9jn.png",
    },
    {
      category: "Table",
      categoryImg:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1687009007/ozby3umdkkq52kldepem.png",
    },
  ],
  settings: [
    {
      about:
        '<p><span style="font-size: 24px;"><strong>About</strong></span></p><br><p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam repellendus doloremque beatae consequuntur qui dolorem, laudantium reprehenderit, est deserunt vitae quo quia quod accusamus. Beatae minus voluptatum delectus sint explicabo vel in mollitia, eum unde aliquam pariatur facere odit voluptatibus deleniti cum culpa totam? Ab eaque cum molestias commodi, incidunt facilis quis magnam nisi eligendi aliquam atque distinctio corrupti animi in ut iusto facere enim culpa officiis excepturi tenetur aut numquam alias. Sed cum voluptatibus aliquam qui nostrum minus maiores, nulla veritatis illum delectus voluptatem ab minima, quas quod eaque reprehenderit recusandae itaque perferendis optio aut. Minima natus perspiciatis illo.</p><p><br></p>',
      terms:
        '<p><strong style="font-size: 24px;">Terms</strong></p><br><p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam repellendus doloremque beatae consequuntur qui dolorem, laudantium reprehenderit, est deserunt vitae quo quia quod accusamus. Beatae minus voluptatum delectus sint explicabo vel in mollitia, eum unde aliquam pariatur facere odit voluptatibus deleniti cum culpa totam? Ab eaque cum molestias commodi, incidunt facilis quis magnam nisi eligendi aliquam atque distinctio corrupti animi in ut iusto facere enim culpa officiis excepturi tenetur aut numquam alias. Sed cum voluptatibus aliquam qui nostrum minus maiores, nulla veritatis illum delectus voluptatem ab minima, quas quod eaque reprehenderit recusandae itaque perferendis optio aut. Minima natus perspiciatis illo.</p>',
      returns: "<p>Your return here</p>",
      privacy:
        '<p><span style="font-size: 24px;"><strong>Privacy Policy</strong></span></p><br><p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam repellendus doloremque beatae consequuntur qui dolorem, laudantium reprehenderit, est deserunt vitae quo quia quod accusamus. Beatae minus voluptatum delectus sint explicabo vel in mollitia, eum unde aliquam pariatur facere odit voluptatibus deleniti cum culpa totam? Ab eaque cum molestias commodi, incidunt facilis quis magnam nisi eligendi aliquam atque distinctio corrupti animi in ut iusto facere enim culpa officiis excepturi tenetur aut numquam alias. Sed cum voluptatibus aliquam qui nostrum minus maiores, nulla veritatis illum delectus voluptatem ab minima, quas quod eaque reprehenderit recusandae itaque perferendis optio aut. Minima natus perspiciatis illo.</p>',
      currency: "USD",
      currencySign: "$",
      tax: "0.2",
      shipping: "24",
      express: " Express shipping: (1-2 business days)",
      expressCharges: "28",
      standard: "Standard shipping: (2-3 business days)",
      standardCharges: "0",
      facebook: "https://web.facebook.com/",
      twitter: "https://twitter.com/",
      youtube: "https://youtube.com/",
      instagram: "https://www.instagram.com/",
      pinterest: "https://www.pinterest.com/",
      webname: "shopFinity",
      bannerBackground:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1673724164/banner2_l71yuh.png",
      sizeGuide: "size guidelines",
      reviewGuide: "review guidelines",
      appstore: "",
      bulk: "Corporate & Bulk Purchasing",
      buyInfo: "How to buy",
      careers: "careers here",
      ourcares: "Our cares info here",
      ourstores: "Our stores info here",
      playstore: "",
      email: "info@example.com",
      messenger: "unknown.unknown",
      whatsapp: "+0 123-456-7890",
      rate: 81.99,
      exhangerate: "10270e08382c90d68a845cdd",
      logo: "https://res.cloudinary.com/dstj5eqcd/image/upload/v1692095770/d26wuxkgcqvsh8mue9m7.png",
      payUPriv: "584af1fe-ad9c-4ae3-b18f-da86b3933c7d",
      payUPub: "6cd530c6-f2d3-41ab-b1f2-8d56418ac919",
      paystackkey: "pk_test_ef13bcd8c41beba368902728447ba2b4f79a3287",
      paytmid: "frogiro89f409r099rofhepko",
      paytmkey: "frogiro89f409r099rofhepko",
      razorkeyid: "rzp_test_yyI1vXw8dNpnfO",
      razorsecret: "kIwDzb0JYPzwzoePpseCBEXe",
      shortDesc:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam repellendus doloremque beatae consequuntur qui dolorem, laudantium reprehenderit, est deserunt vitae",
      stripeApiKey:
        "sk_test_51LddZCG74SnLVBhQgEpJEtwmrZun228Px4rYGTLUZ1xC81NzN2TP2svtDGXT3UPaYcEy8jtfj6X6k5EbzcEROpFu00eKwTYye4",
      stripePubKey:
        "pk_test_51LddZCG74SnLVBhQAzsedUUcKxd33HOpAIThNyxKl2l4mxvCj8uywmQFZHNq5EmiIn6jNrAVGrBqT1tWHprcD3XF00xOSuchsE",
      googleAnalytics: "G-MNF3WLVGEC",
      storeAddress: "unknown, unknown Nigeria",
      themeFaq: "<p>theme faq guidelines</p>",
      messengerAppId: "6222862251176447",
      messengerPageId: "107454247668619",
      faviconUrl:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1690410281/mhhrdg6d7yxzqvqd8vwm.png",
      paypal:
        "AVSqcwu8gCktEtMw2sSWrXdATPkiXfrfJIGPJvp7YJYqEcrwcXOhujirF6QEBIdigzqQzw6tSJ3_rgey",
    },
  ],
};

export default data;
