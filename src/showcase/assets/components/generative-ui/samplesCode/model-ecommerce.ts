export const generativeUIeCommerce = `
<header class="horizontal-flex">
    <h1 class="heading-1"> Welcome to Our E - commerce Store </h1>
</header>
<main class="vertical-flex">
    <ch-grid row-selection-mode="none" keyboard - navigation - mode="focus" class="hydrated"> 
        <ch-grid-columnset class="hydrated"> 
            <ch-grid-column column-id="product" column-name="Product" settingable="false" sortable="true" order="1" size="auto" class="hydrated"></ch-grid-column> 
            <ch-grid-column column-id="price" column-name="Price" settingable="false" sortable="true" order="2" size="auto" class="hydrated"></ch-grid-column> 
            <ch-grid-column column-id="action" column-name="Action" settingable="false" sortable="true" order="3" size="auto" class="hydrated"> </ch-grid-column> 
        </ch-grid-columnset>
        <ch-grid-row rowid="product1"> 
            <ch-grid-cell>
                <div class="card"> 
                    <img src="product1.jpg" alt="Product" 1="" class="product-image">
                    <h2 class="heading-2"> Product 1 </h2>
                            <p class="text-body-1">$19.99</p> 
                            <button class="button-primary"> Add toCart </button>
                </div> 
            </ch-grid-cell> 
            <ch-grid-cell>$19.99</ch-grid-cell> 
            <ch-grid-cell> 
                <button class="button-primary"> Add to Cart </button>
            </ch-grid-cell> 
        </ch-grid-row> 
        <ch-grid-row rowid="product2">
            <ch-grid-cell>
                <div class="card"><img src="product2.jpg" alt="Product" 2=""
                        class="product-image">
                    <h2 class="heading-2">Product 2</h2>
                    <p class="text-body-1"> $29.99 </p>
                    <button class="button-primary">Add to Cart</button>
                </div>
            </ch-grid-cell> 
            <ch-grid-cell> $29.99 </ch-grid-cell>
                <ch-grid-cell>
                    <button class="button-primary">Add to Cart</button> 
                </ch-grid-cell> 
        </ch-grid-row>
        <ch-grid-row rowid="product3"> 
            <ch-grid-cell>
                <div class="card"> 
                    <img src="product3.jpg" alt="Product" 3="" class="product-image">
                    <h2 class="heading-2"> Product 3 </h2>
                    <p class="text-body-1">$39.99</p>
                    <button class="button-primary"> Add to Cart </button>
                </div>
            </ch-grid-cell> 
            <ch-grid-cell>$39.99</ch-grid-cell> 
            <ch-grid-cell>
                <button class="button-primary"> Add to Cart </button>
            </ch-grid-cell> 
        </ch-grid-row> 
        <ch-grid-row rowid="product4"> 
            <ch-grid-cell>
                <div class="card"><img src="product4.jpg" alt="Product" 4=""
                        class="product-image">
                    <h2 class="heading-2">Product 4</h2>
                    <p class="text-body-1"> $49.99 </p>
                    <button class="button-primary">Add to Cart</button>
                </div>
            </ch-grid-cell> 
            <ch-grid-cell> $49.99</ch-grid-cell>
            <ch-grid-cell>
                <button class="button-primary">Add to Cart</button> 
            </ch-grid-cell> 
        </ch-grid-row>
    </ch-grid> 
</main>
`
    