import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { SignalRConnection } from "../models/signal-r-connection.model";
import { environment } from "../../environments/environment";
import * as SignalR from "@aspnet/signalr";

@Injectable({
  providedIn: "root"
})
export class SignalRService {
  dataFlow: Subject<string> = new Subject();
  private hubConnection: SignalR.HubConnection;

  constructor(private http: HttpClient) {}

  init() {
    this.http
      .get<SignalRConnection>(`${environment.baseUrl}negotiate`)
      .subscribe(con => {
        const options = {
          accessTokenFactory: () => con.accessToken
        };

        this.hubConnection = new SignalR.HubConnectionBuilder()
          .withUrl(con.url, options)
          .configureLogging(SignalR.LogLevel.Information)
          .build();

        this.hubConnection.on("notify", data => {
          this.dataFlow.next(data);
        });

        this.hubConnection.start().catch(error => console.error(error));

        this.hubConnection.serverTimeoutInMilliseconds = 300000;

        this.hubConnection.keepAliveIntervalInMilliseconds = 300000;

        this.hubConnection.onclose(error => {
          this.hubConnection.start();
          console.error(`Something went wrong: ${error}`);
        });
      });
  }

  sendMessage(message: string): Observable<object> {
    const requestUrl = `${environment.baseUrl}message`;
    return this.http.post(requestUrl, message);
  }
}
