# Dstore

Dstore is a simple e-commerce platform with basic functionalities for both users and admins. It supports product browsing, checkout, order tracking, user authentication, and administrative features for managing products

## User Stories

### PUBLIC 

#### Products
- [ X ] As a user, I can search the related products 
- [ X ] As a user, I can filter the product
- [ X ] As a user, I can view product details 

-----------------------------------------------------------------------------

### REGISTERED  User

#### Authentication
- [ X ] As a user, I can register for a new account with my name, email, and password.
- [ X ] As a user, I can sign in with my email and password.

#### Users
- [ X ] As a registered user, I can log in to the app, 
- [ X ] As a registered user, I can get my current profile info (stay signed in after page refresh).
- [ X ] As a registered userr, I can update my profile info like First Name, Last Name, Phone, Address,... .

- [ X ] As a registered user, I can check out securely.

- [ X ] As a registered user, I want to be able to check history order.
- [ X ] As a registered user, I want to be able to check out my cart with Cash On Delivery payment options.

#### Products
- [ X ] As a registered user, I can add products to my cart.
- [ X ] As a registered user, I can buy products right now.

#### Checkout
- [ X ] As a registered user, I can checkout the selected products.
- [ X ] As a registered user, I can select payment method.
- [ X ] As a registered user, I can choose address to ship.

#### Cart
- [ X ] As a registered user, I can adjust products' quantity to my cart
- [ X ] As a registered user, I can get list products to my cart
- [ X ] As a registered user, I can delete selected products in my cart
- [ X ] As a registered user, after payment, it automatically remove the checkout products

#### Order 
- [ X ] As a registered user, I can see history orders

-----------------------------------------------------------------------------

### ADMIN  

#### Products
- [ X ] As Admin, I can update info products.
- [ X ] As Admin, I can create a new product.
- [ X ] As Admin, I can update quantity.
- [ X ] As Admin, I can see the private product. (delete product)

## Endpoint APIs

### Auth APIs

[X]
/**
 * @route POST /auth/login
 * @description login with email and password
 * @body {email, password}
 * @access Public
 */


 
### User APIs
[X] 
/**
 * @route POST /users
 * @description Register new user
 * @body {name, email, password}
 * @access Public
 */
 
[X]
/**
 * @route GET /users/me
 * @description Get current user info
 * @access Login required,  CurrentUser === userId , ADMIN 
 */
[X]
/**
 * @route PUT /users/:id
 * @description Update user profile
 * @body { "firstName",
    "lastName",
    "email",
    "phone",

    "password",

    "avatarUrl",
    "coverUrl",

    "city",
    "country",
    "state",
    "zipCode",
    "address",}
 * @access CurrentUser === userId || ADMIN 
 */

### Product APIs
[X] 

/**
 * @route POST /product
 * @description Create a new product
 * @body {product_name, product_thumb, product_description, product_price,
    product_type, product_attributes, product_quantity}
 * @access Private ( ADMIN )
 */
 
 [X] 

/*

 * @route GET /product/search?keySearch=phone&page=1&limit=5&isPublished=true&priceRange=between&category=All&sort=priceDesc
 * @description Using Search to GET list Products
 * @access Public
 */
 
  [X]
/** 
 * @route GET /product?sort='ctime'&page=1&limit=50&isPublished=true&priceRange=between&category=All
 * @description Using Search to GET list Products
 * @access Public
 */
 
  [X]
/**
 * @route GET /product/:product_id
 * @description  GET a detailed Product by ID
 * @access Public
 */
 
  [X]
/**
 * @route PATCH /product/:product_id
 * @description  Update info Product by ID
 * @body {product_name, product_thumb, product_description, product_price,
    product_type, product_attributes, product_quantity,
}
 * @access Private ( ADMIN )
 */

  [X]
/**
 * @route PATCH /product/:product_id
 * @description  Update info Product by ID After paying
 * @body {product_quantity}
 * @access Private user
 */
 
### Cart APIs
 
 [X]
/**
 * @route POST /cart 
 * @description  
 * create a cart if user add 1 product 
 * check cart existed 
 * check product existed in cart => Y: update quantity || N: create new product in cart
 * @body {
 * {
    "product": {

        "productId": "6706b09bfb15ef50c8e4f872",
        "quantity": "123"
    }
    
}}
 * @access Private User
 */
 
 [X]
 
/**
 * @route GET /cart 
 * @description  
 * Get list products in cart
 * @access Private
 */
 
 []

/**
 * @route POST /cart/update
 * @description  
 * Update quantity's product in cart
 * @body 
 * order_ids [
 *  {
 *    item_products: [
 *      {
 *        productId,
 *        price,
 *        quantity,
 *        old_quantity
 *      }
 *    ]
 *   }
 * ]
 * @access Private 
 */
 []
/**
 * @route DELETE /cart 
 * @description  
 * Delete product in cart
 * @body {
    "productId": "6706b09bfb15ef50c8e4f872"
}
 * @access Private 
 */

### Checkout APIs

 [X]

/**
 * @route POST /checkout
 * @description  checkout REVIEW
 * @body 
 * {
 * cartId
  "order_ids": [
    {
      "discounts": [
        {
          "discountId",
          "codeId"
        }
      ],
      "item_products": [
        {
          "price",
          "quantity",
          "productId"
        }
      ]
    },
    {
    "discounts": [
        {
          "discountId",
          "codeId"
        }
      ],
      "item_products": [
        {
          "price",
          "quantity",
          "productId"
        }
      ]
    }
  ]
}
 * @access Private user
 */
 []
 


// PayPal Order Routes
[X]
/**
 * @route POST /checkout/orders
 * @description Create a PayPal order for the specified items in the user's cart
 * @body 
 * {
 *   "cartId": "string",
 *   "order_ids": [
 *     {
 *       "discounts": [
 *         {
 *           "discountId": "string",
 *           "codeId": "string"
 *         }
 *       ],
 *       "item_products": [
 *         {
 *           "price": "number",
 *           "quantity": "number",
 *           "productId": "string"
 *         }
 *       ]
 *     }
 *   ]
 * }
 * @access Private user **/

[X]
/**
 * @route POST /checkout/orders/:orderID/capture
 * @description Capture the PayPal order after approval to finalize payment
 * @param {string} orderID - The PayPal order ID to capture payment for
 * @access Private user
 */


### Order APIs

[X]

/**
 * @route Patch /orders/completed
 * @description  
 * Update quantity's product in cart
 * @body 
 * @access Private || ADMIN
 */

[X]
/**
 * @route Post /orders/create/:orderID/
 * @description  
Create Order in Database after Paying, Capture
 * @body 
{
    paypalOrderId,
    paypalCaptureId,
    currencyCode,
    value,
    payerEmail,
    payerId,
    order_checkout,
    order_shipping,
    order_products,
  }
 * @access Private user
 */