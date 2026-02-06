import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Encode from "@/pages/Encode";
import Decode from "@/pages/Decode";
import Capacity from "@/pages/Capacity";
import History from "@/pages/History";
import Docs from "@/pages/Docs";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Encode} />
      <Route path="/decode" component={Decode} />
      <Route path="/capacity" component={Capacity} />
      <Route path="/history" component={History} />
      <Route path="/docs" component={Docs} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
