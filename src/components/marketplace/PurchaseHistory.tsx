import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface PurchaseHistoryProps {
  purchases: Array<{
    id: string;
    created_at: string;
    item: {
      title: string;
      price: number;
      description: string;
    };
    quantity: number;
    total_price: number;
  }>;
}

export const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ purchases }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Historial de Compras</span>
          <Badge variant="secondary">{purchases.length} compras</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        {purchases.map((purchase) => (
          <div key={purchase.id} className="flex justify-between items-center py-4">
            <div>
              <p className="font-medium">{purchase.item.title}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(purchase.created_at)}
              </p>
              <p className="text-sm text-muted-foreground">
                Cantidad: {purchase.quantity}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">
                {purchase.total_price} monedas
              </p>
              <p className="text-sm text-muted-foreground">
                {purchase.item.price} c/u
              </p>
            </div>
          </div>
        ))}

        {purchases.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No hay compras registradas
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PurchaseHistory;