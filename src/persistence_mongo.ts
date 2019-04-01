import { Saved, Official, ShopOwner, CollectedWaste, Persistence } from "./persistence";
import mongodb from "mongodb";
export { PersistenceMongo, IdType };

const COLLECTION_SHOP_OWNER = "shop_owner";
const COLLECTION_OFFICIAL = "official";
const COLLECTION_COLLECTED_WASTE = "collected_waste";

interface MongoSaved {
    _id: mongodb.ObjectID;
}

type IdType = mongodb.ObjectID;
type SavedType = Saved<IdType>;
class PersistenceMongo implements Persistence<IdType> {

    private db: mongodb.Db;

    constructor(db: mongodb.Db) {
        this.db = db;
    }

    public async shop_owner_get(username: string): Promise<ShopOwner & SavedType | undefined> {
        const user: (ShopOwner & MongoSaved) | undefined = await this.db.collection(COLLECTION_SHOP_OWNER)
            .findOne({ username });
        if (user) {
            return {
                id: user._id,
                ...(user as ShopOwner),
            };
        }

        return undefined;
    }


    public async shop_owner_signup(shop_owner: ShopOwner): Promise<SavedType> {
        const x = await this.db.collection(COLLECTION_SHOP_OWNER).insert(shop_owner);
        return { id: x.insertedId };
    }


    public async official_get(username: string): Promise<Official & SavedType> {
        const user: (Official & MongoSaved) | undefined = await this.db.collection(COLLECTION_OFFICIAL)
            .findOne({ username });
        if (user) {
            return {
                id: user._id,
                ...(user as Official),
            };
        }

        return undefined;
    }


    public async official_signup(official: Official): Promise<Saved<IdType>> {
        const x = await this.db.collection(COLLECTION_OFFICIAL).insert(official);
        return { id: x.insertedId };
    }


    public async collected_waste_save(shop_owner: SavedType, collected_waste: CollectedWaste): Promise<SavedType> {
        const doc = { shop_owner_id: shop_owner.id, ...collected_waste };
        const x = await this.db.collection(COLLECTION_COLLECTED_WASTE).insert(doc);
        return { id: x.insertedId };
    }


    public async collected_waste_get_all(
        shop_owner: Saved<IdType> | undefined): Promise<Array<SavedType & CollectedWaste>> {
        let filter = {};
        if (shop_owner) {
            filter = { shop_owner_id: shop_owner.id };
        }

        return await this.db.collection(COLLECTION_COLLECTED_WASTE).find(filter).toArray();
    }

}
