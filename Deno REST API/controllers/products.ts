import { Client } from "https://deno.land/x/postgres/mod.ts";

import { Product } from "../types.ts";
import { dbCreads } from "../config.ts";

// Initialize Dbclients
let client = new Client(dbCreads);

// let products: Product[] = [
//   {
//     id: "1",
//     name: "Product One",
//     description: "This is the product one",
//     price: 32.32,
//   },
//   {
//     id: "2",
//     name: "Product Two",
//     description: "This is the product two",
//     price: 31.2,
//   },
//   {
//     id: "1",
//     name: "Product Three",
//     description: "This is the product three",
//     price: 89.23,
//   },
// ];

// @desc    Get all the products
// @routes  GET /api/v1/products

const getProducts = async ({ response }: { response: any }) => {
  // response.body = {
  //   success: true,
  //   data: products,
  // };

  try {
    await client.connect();
    const result = await client.query("SELECT * FROM products");
    const products = new Array();
    result.rows.map((p) => {
      let obj: any = new Object();

      result.rowDescription.columns.map((el, i) => {
        obj[el["name"]] = p[i];
      });

      products.push(obj);
    });

    response.body = {
      success: true,
      data: products,
    };
  } catch (err) {
    response.status = 500;
    response.body = {
      success: false,
      msg: err.toString(),
    };
  } finally {
    await client.end();
  }
};

// @desc    Get single products
// @routes  GET /api/v1/products/:id

const getProduct = async (
  { params, response }: { params: { id: string }; response: any },
) => {
  try {
    await client.connect();

    const result = await client.query(
      "SELECT * FROM products WHERE id = $1",
      params.id,
    );

    // Checking for existenece of row
    if (result.rows.toString() === "") {
      response.status = 404;
      response.body = {
        success: false,
        msg: `No product with id : ${params.id}`,
      };
      return;
    } else {
      const product: any = new Object();
      result.rows.map((p) => {
        result.rowDescription.columns.map((el, i) => {
          product[el.name] = p[i];
        });
      });
      response.body = {
        success: true,
        data: product,
      };
    }
  } catch (err) {
    response.status = 500;
    response.body = {
      success: false,
      msg: err.toString(),
    };
  } finally {
    await client.end();
  }

  // const product: Product | undefined = products.find((p) => p.id === params.id);
  // if (product) {
  //   response.status = 200;
  //   response.body = {
  //     success: true,
  //     data: product,
  //   };
  // } else {
  //   response.status = 400;
  //   response.body = {
  //     success: false,
  //     msg: "No product found",
  //   };
  // }
};

// @desc    Add a product
// @routes  POST /api/v1/products

const addProduct = async (
  { request, response }: { request: any; response: any },
) => {
  const body = await request.body();

  if (!request.hasBody) {
    response.status = 400;
    response.body = {
      success: false,
      msg: "No data",
    };
  } else {
    const product: Product = body.value;
    // product.id = v4.generate();
    // products.push(product);
    // response.status = 201;
    // response.body = {
    //   success: true,
    //   data: product,
    // };

    try {
      await client.connect();
      const result = await client.query(
        "INSERT INTO products(name, description, price) VALUES($1, $2, $3)",
        product.name,
        product.description,
        product.price,
      );

      response.status = 201;
      response.body = {
        success: true,
        data: product,
      };
    } catch (err) {
      response.status = 500;
      response.body = {
        success: false,
        msg: err.toString(),
      };
    } finally {
      await client.end();
    }
  }
};

// @desc    Update product
// @routes  PUT /api/v1/products/:id

const updateProduct = async (
  { params, request, response }: {
    params: { id: string };
    request: any;
    response: any;
  },
) => {
  await getProduct({ params: { "id": params.id }, response });

  if (response.status === 404) {
    response.body = {
      success: false,
      msg: response.body.msg,
    }, response.status = 404;
    return;
  } else {
    const body = await request.body();
    const product = body.value;
    if (!request.hasBody) {
      response.status = 400;
      response.body = {
        success: false,
        msg: "No data",
      };
    } else {
      try {
        await client.connect();
        const result = await client.query("UPDATE products SET name = $1, description = $2, price = $3 WHERE id = $4", 
        product.name, 
        product.description, 
        product.price, 
        params.id);

        response.status = 200;
        response.body = {
          success: true,
          data: product,
        };

      } catch (err) {
        response.status = 500;
        response.body ={
          success: false,
          msg: err.toString()
        }
      } finally {
        await client.end();
      }
    }
  }

  // const product: Product | undefined = products.find((p) => p.id === params.id);

  // if (product) {
  //   const body = await request.body();
  //   const updateData: { name?: string; description?: string; price?: number } =
  //     body.value;
  //   products = products.map((p) =>
  //     p.id === params.id ? { ...p, ...updateData } : p
  //   );
  //   response.status = 200;
  //   response.body = {
  //     success: true,
  //     data: products,
  //   };
  // } else {
  //   response.status = 400;
  //   response.body = {
  //     success: false,
  //     msg: "No product found",
  //   };
  // }
};

// @desc    Delete product
// @routes  DELETE /api/v1/products/:id

const deleteProduct = async(
  { params, response }: { params: { id: string }; response: any },
) => {
  await getProduct({ params: { "id": params.id }, response });

  if (response.status === 404) {
    response.body = {
      success: false,
      msg: response.body.msg,
    }, response.status = 404;
    return;
  } else {
    try {
      await client.connect();
      const result = await client.query("DELETE FROM products WHERE id = $1", params.id);
      response.status = 200;
      response.body = {
        success: true,
        msg: "Product Removed",
      }
    } catch(err){
      response.status = 500;
      response.body ={
        success: false,
        msg: err.toString()
      }
    }finally{
      await client.end();
    }
  }
 
  // products = products.filter((p) => p.id !== params.id);
  // response.body = {
  //   success: true,
  //   msg: "Product Removed",
  // };
};

export { getProducts, getProduct, addProduct, updateProduct, deleteProduct };
