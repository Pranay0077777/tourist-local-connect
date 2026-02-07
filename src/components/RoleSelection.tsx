import { Map, Compass } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface RoleSelectionProps {
    onSelectRole: (role: 'guide' | 'tourist') => void;
    onBack: () => void;
}

export function RoleSelection({ onSelectRole, onBack }: RoleSelectionProps) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900">Choose Your Path</h2>
                    <p className="text-gray-600">Select how you want to use the application</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card
                        className="p-8 cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500 group"
                        onClick={() => onSelectRole('tourist')}
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                                <Map className="w-10 h-10 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold">I'm a Traveller</h3>
                            <p className="text-gray-500 text-sm">
                                Looking to explore cities with trusted local guides
                            </p>
                        </div>
                    </Card>

                    <Card
                        className="p-8 cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-green-500 group"
                        onClick={() => onSelectRole('guide')}
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                                <Compass className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold">I'm a Guide</h3>
                            <p className="text-gray-500 text-sm">
                                Local expert ready to show my city and earn
                            </p>
                        </div>
                    </Card>
                </div>

                <div className="text-center">
                    <Button variant="ghost" onClick={onBack}>
                        Back
                    </Button>
                </div>
            </div>
        </div>
    );
}
