
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Star } from "lucide-react";

const StudentAchievements: React.FC<{
  achievements: any[];
}> = ({ achievements }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Mis Logros
        </CardTitle>
        <CardDescription>Logros y reconocimientos obtenidos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <p className="text-4xl font-bold">{achievements.length}</p>
          <p className="text-sm text-muted-foreground">logros obtenidos</p>
        </div>
        
        <div className="space-y-4">
          {achievements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aún no has obtenido ningún logro
            </p>
          ) : (
            <>
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-start gap-3 border-b pb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex-shrink-0 flex items-center justify-center text-amber-600">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{achievement.achievementType?.name || "Logro"}</p>
                      <Badge variant="outline" className="text-green-600 bg-green-50">
                        +{achievement.coins_awarded} monedas
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {achievement.description || achievement.achievementType?.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(achievement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentAchievements;
