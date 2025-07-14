-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "archived_at" DATETIME,
    "reported_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "merchant" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "reimbursable" BOOLEAN NOT NULL DEFAULT false,
    "original_currency" TEXT NOT NULL,
    "original_amount" REAL NOT NULL,
    "comment" TEXT,
    "type" TEXT,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT,
    "second_category_id" TEXT,
    CONSTRAINT "expense_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "expense_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "expense_second_category_id_fkey" FOREIGN KEY ("second_category_id") REFERENCES "category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_expense" ("amount", "archived_at", "category_id", "comment", "created_at", "id", "merchant", "original_amount", "original_currency", "reimbursable", "reported_at", "updated_at", "user_id") SELECT "amount", "archived_at", "category_id", "comment", "created_at", "id", "merchant", "original_amount", "original_currency", "reimbursable", "reported_at", "updated_at", "user_id" FROM "expense";
DROP TABLE "expense";
ALTER TABLE "new_expense" RENAME TO "expense";
CREATE UNIQUE INDEX "expense_merchant_category_id_original_amount_original_currency_reported_at_user_id_key" ON "expense"("merchant", "category_id", "original_amount", "original_currency", "reported_at", "user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
