export { Saved, Official, ShopOwner, CollectedWaste, Persistence };

interface Saved<T> {
    id: T;
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

interface Persistence<T> {
    shop_owner_get(username: string): Promise<(ShopOwner & Saved<T>) | undefined>;
    shop_owner_signup(shop_owner: ShopOwner): Promise<Saved<T>>;

    official_get(username: string): Promise<(Official & Saved<T>) | undefined>;
    official_signup(official: Official): Promise<Saved<T>>;

    collected_waste_save(shop_owner: Saved<T>, collected_waste: CollectedWaste): Promise<Saved<T>>;
    collected_waste_get_all(shop_owner: Saved<T> | undefined): Promise<Array<Saved<T> & CollectedWaste>>;
}
