export {Saved, Official, ShopOwner, CollectedWaste, Persistence};

interface Saved {
    id: number;
}

interface Official {
    name: string;
    username: string;
    password: string;
}

interface ShopOwner {
    name: string;
    address: string;
    username: string;
    password: string;
}

interface CollectedWaste {
    mrp: string;
    refunded: string;
}

interface Persistence {
    shop_owner_login(username: string, password: string): (ShopOwner & Saved) | undefined;
    shop_owner_signup(shop_owner: ShopOwner): Saved;

    official_login(username: string, password: string): (Official & Saved) | undefined;
    official_signup(official: Official): Saved;

    collected_waste_save(collected_waste: CollectedWaste): Saved;
    collected_waste_get_all(shop_owner_id: number|undefined): CollectedWaste[];
}
