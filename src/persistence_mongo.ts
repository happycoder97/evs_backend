import { Saved, Official, ShopOwner, CollectedWaste, Persistence } from "./persistence";
import mongodb from "mongodb";
export { PersistenceMongo };

class PersistenceMongo implements Persistence {

    private client: mongodb.MongoClient;

    constructor(client: mongodb.MongoClient) {
        this.client = client;
    }

    public shop_owner_login(username: string, password: string): ShopOwner & Saved {
        throw new Error("Method not implemented.");
    }


    public shop_owner_signup(shop_owner: ShopOwner): Saved {
        throw new Error("Method not implemented.");
    }


    public official_login(username: string, password: string): Official & Saved {
        throw new Error("Method not implemented.");
    }


    public official_signup(official: Official): Saved {
        throw new Error("Method not implemented.");
    }


    public collected_waste_save(collected_waste: CollectedWaste): Saved {
        throw new Error("Method not implemented.");
    }


    public collected_waste_get_all(shop_owner_id: number): CollectedWaste[] {
        throw new Error("Method not implemented.");
    }

}
